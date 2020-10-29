

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express(); 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

//Mongoose connected with mongoDB
mongoose.connect("mongodb+srv://admin-neeraj:test@todolist.rqjug.mongodb.net/todoListDB", { useNewUrlParser: true });

//mongoose Schema
const itemsSchema = {
    name: String
};
//Mongoose Model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
  });
  
  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });
  
  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });
  


const defaulItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/:customListName/", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new List
                const list = new List({
                    name: customListName,
                    items: defaulItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                //show an existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
            }
        }
    });

});




app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundItems.length === 0) {

                Item.insertMany(defaulItems, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Succesfully added");
                    }
                });
                res.redirect("/");
            } else {
                res.render("list", { listTitle: "Today", newListItems: foundItems });

            }

        }
    });

});

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;


    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }


});

app.post("/delete/", function (req, res) {
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.deleteOne({ _id: checkedItemID }, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Deleted Succesfully");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemID } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }


});



app.get("/about/", function (req, res) {
    res.render("about");
});

app.get("/*", function (req, res) {
    res.send("<h1> Please Go Back This is not the Page you are looking for</h1>");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
    console.log("Server has started");
});



//Inserting Items HEre

// Item.insertMany(defaulItems,function(err){
//     if(err){
//         console.log(err);
//     }else{
//         console.log("Succesfully added");
//     }
// });



//Finding Itemms

// Item.find({}, function (err, foundItems) {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log("Found Items");
//         console.log(foundItems);
//     }
// });



//Deleting Duplicate Items from my Database::

// Item.deleteMany({_id:"5f994be05a77bf1aa03b76f9"},function(err){
//     if(err){
//         console.log(err);
//     }else{
//         console.log("Deleted Succesfully");
//     }
// });