var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

    
// APP CONFIG
mongoose.connect("mongodb://127.0.0.1/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.set('port', 3000);//3000 orginal

// MONGOOSE/Model Config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//created the blog post
// Blog.create({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1521185496955-15097b20c5fe?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=b73970e97b923e72be9355cb15099091&auto=format&fit=crop&w=900&q=60",
//     body: "Hello this is a blog post!"
// });

app.get("/", function(req, res){
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("Error!");
        } else {
            res.render("index", {blogs: blogs}); //data came back from DB .find in blogs(2nd), then we are sending it via the name blogs 
        }
    });
});
//new blog post route
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// create new blog 
app.post("/blogs", function(req, res){
    // create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } 
        else{
            // redirect to the index
            res.redirect("/blogs");
        }
    });
});


//Show route
app.get("/blogs/:id", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    })
});

// Edit route
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE Route
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// Delete route
app.delete("/blogs/:id", function(req, res){
    // destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs");
        }
    });
});

// RESTFUL ROUTES
app.listen(app.get('port'), function(){
    console.log('The YelpCamp Server Has Started! on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});