//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-viktoriia:Test123@cluster0.upgf5.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema ={
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:"todo1"
});

const item2 = new Item({
  name:"todo2"
});

const item3 = new Item({
  name:"todo3"
});

const startItems = [item1, item2, item3];

const listSchema = {
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0){
      Item.insertMany(startItems, function(err){
        if (err){
          console.log(err);
        }else{
          console.log("successfuly success");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Todo list", newListItems: foundItems});
    };
  });
});

app.get("/:listName", function(req, res){
  const listName = _.capitalize(req.params.listName);

  List.findOne({name:listName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: listName,
          items: startItems
        });
        list.save();  
        res.redirect("/"+listName); 
      }else{
        res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if (listName === "Todo list"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkedOne;
  const listName = req.body.listName;
 
  if(listName === "Todo list"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err){
        console.log(err);
      }else{
        console.log("successfully success");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName}, {$pull:{items: {_id:checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started");
});
