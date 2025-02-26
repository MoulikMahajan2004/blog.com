const express = require('express');
const app = express();
const { mongo } = require('./services/db')
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const PORT = 9000
const Path = require('path');
const crypto = require('crypto');
const path = require('path');
app.use(express.static(Path.join(__dirname, 'public')));
//setting the frontend engine
const cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');

//form data
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



//------------------MODEL ------------------------
const UserModel = require('./model/usermodel');
const BlogModel = require('./model/Blogmodel');
//--------------------------------------------------

//-----------------------file upload ---------------
const upload = require('./config/Multer')
//--------------------------------------------------
//Middleware -
const { RoleBasedAccess } = require('./middleware/Authentication');




//------------all the end pointsp----------
//***CREATING THE ENTRANCE */
app.get('/', (req, res) => {
    res.render('entrance');
})

app.post('/', async (req, res) => {
    //if the fields are empty and user press the submit button 
    if (!req.body.Email || !req.body.Password) return res.redirect('/');
    //user check in data base command 
    const UserData = await UserModel.findOne({ Email: req.body.Email }, { Password: 1, Role: 1 });
    //if no user is present
    if (!UserData) return res.redirect('/');
    //storing the obtain password and the database encrypted password
    const UserEnteredPassword = req.body.Password;
    const HashedPassword = UserData.Password;
    //comparing the password so that user can access the data 
    bcrypt.compare(UserEnteredPassword, HashedPassword, (err, check) => {
        console.log("chweck riggering", check);
        if (check) {
            //generating the jwt token 
            const Token = jwt.sign({
                Email: req.body.Email,
                Role: UserData.Role
            }, "test", {
                algorithm: 'HS512',
                //token expires in 30 seconds 1000 = 1 second
                expiresIn: "300000"
            })
            //storing the token in the cookie
            //This also help in refreshing the cookie and making to remove once it the session is over 
            //the time of it and the jwt is same so that once the session of jwt is over it automatically delete
            res.cookie("Token", Token, { maxAge: 30000 }); // The cookie will expire after 2(2000) seconds.
            //redirection to the main page /blog
            res.redirect('/blog')
        }
        if (err) {
            console.log("error triggering", err);
        }
    })
})


//***CREATING THE SIGNUP */
app.get('/signup', (req, res) => {
    res.render('signup');
});

//creating the user 
app.post('/signup', (req, res) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, async (errr, hashpasswrod) => {
            await UserModel.create({
                Username: req.body.name,
                Email: req.body.email,
                Password: hashpasswrod
            });
        })
    })
    res.redirect("/");
})

//----------------------------------------------------mainpage-----------------------------------------
app.get('/blog', async (req, res) => {
    //sending the user data to the main page 
    const Tokenextract = req.cookies.Token;
    //if no tokrn found return the user to main page 
    if (!Tokenextract) return res.redirect('/');
    try {
        const cookieData = jwt.verify(Tokenextract, "test");
        // const blogData = await BlogModel.find();
      //  const blogData = await BlogModel.findOne({ _id:  }, { blogheading: 1 });
        // const blogData = await BlogModel.find({_id:'677f507274a128dc8632c5d8'},{blogheading:1});
       // console.log(blogData);
        console.log(cookieData.Email); // Check this to ensure the payload is as expected.
        //fetching the detail 
        const Userdetail = await UserModel.findOne({ Email: cookieData.Email }, { Email: 1, Username: 1, ProfilePicture: 1 });
        //if the detail is notfetched and someone changed the key then redirect to login page 
        if (!Userdetail) return res.redirect('/');
        const UserBlog = await BlogModel.find({BlogVisibility:"Public"},{Blogheading:1,BlogData:1,BlogImage:1,_id:0});
        console.log(Userdetail.Email, Userdetail.Username);
        res.render('blogmain', { Userdetail,UserBlog });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
})

//-------------------------------------posting the blog -------------------------------------------
app.get('/create', (req, res) => {
    res.render('CreateBlog');
})

app.post('/create', upload.array('filenames', 1), async (req, res) => {
    console.log('trigger');
    // Check if both Blogheading and blogcontent are present
    if (!req.body.heading || !req.body.blogcontent) {
        //console.log('Missing fields. Redirecting...');
        return res.redirect('/create');
    }
    //  if(req.files.lastIndexOf)
    try {
        // Create a new blog entry
        //here we are fetching the user detail using the cookie and entrying the data in the blog post created by which user 
        const cookie = jwt.verify(req.cookies.Token, "test");
        const Created_by = await UserModel.findOne({ Email: cookie.Email }, { _id: 1 });
        const blog = await BlogModel.create({
            BlogCreatedBy: Created_by._id,
            Blogheading: req.body.heading,
            BlogData: req.body.blogcontent,
            BlogImage: req.files.map((file) => file.filename),
            BlogVisibility:req.body.public || req.body.private
        });
        //This is when the user enter the blog and it upodated the user model by pusing the newly created post id to the array of the user
        await UserModel.updateOne({ _id: Created_by._id }, { $push: { BlogPost: blog._id } })

        // Redirect to the homepage or a success page
        //Printing the file data 
        //-------------------BELOW IS THE EXAMPLE OF HOW THE SINGLE UPLOAD WORK------------------------
        //Here we are Posting the files to the local stoarage and below is the uploadsingle variable used to fetch thefile and it contains the column isnisde the bracket which is basically the filename and is using the input tag
        // app.post('/upload', upload.single('filename'), (req, res) => {
        //     //Printing the file data 
        //     console.log(req.file);
        //     res.redirect('/blog')
        // });
        //----------------------------------------------------------------------------------------------
        console.log(req.file);
        return res.redirect('/blog');
    } catch (error) {
        console.error('Error creating blog:', error);
        // Handle the error and redirect to the creation page
        return res.redirect('/create');
    }
});

app.get('/uploadProfileimage', RoleBasedAccess("User"), (req, res) => {
    res.render('Profileupdate.ejs')
})

app.post('/uploadProfileimage', upload.single('profilepicture'), async (req, res) => {
    const cookie_detail = jwt.verify(req.cookies.Token, "test");
    const Userdetail = await UserModel.findOne({ Email: cookie_detail.Email });
    Userdetail.ProfilePicture = req.file.filename;
    Userdetail.save();
    res.redirect('/blog')
})
//---------------------------------------------------listner---------------------------------- 
app.listen(PORT, () => {
    console.log("SERVER STARTED");
});