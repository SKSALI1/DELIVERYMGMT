const express = require('express');
const path = require('path');
const fs = require('fs').promises; // Using promises version of fs
const multer = require('multer');
const CsvModel = require('./model/csvModel')
const mongoose = require('mongoose');
const { type } = require('os');
const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });


mongoose.connect('mongodb+srv://saahilaliofficial:OFN8hihucnGuWEbp@cluster0.vvdjbcn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




//getting the homepage where user will upload the excelfile
app.get('/', (req, res) => {
  res.render('home'); 
});
//getting the all entries page
app.get("/allentries", async(req, res) => {
   try {
    const entries = await CsvModel.find({}).sort({createdAt : -1});
    res.render("allentries", { entries });
  } catch (error) {
    console.log("Error fetching entries",error);
    res.status(500).send("Error fetching entries");
  }
});
//getting the delivery status page
app.get('/isDelivered', async(req, res) => {
  try {
    const entries = await CsvModel.find({}).sort({ createdAt : -1});
    res.render("isDelivered" , {entries});
  } catch (error) {
    console.log(error);
  }
});
//geting the return goods status
app.get('/isReturned', async(req, res) => {
  try {
    const entries = await CsvModel.find({}).sort({ createdAt : -1});
    res.render("isReturned" , {entries});
  } catch (error) {
    console.log(error);
  }
});



//submiting the excel and doing entry
app.post('/submitexcel', upload.single('csvdata'), async (req, res) => {
  if (req.file) {
    try {
      const filePath = req.file.path;
      const data = await fs.readFile(filePath, 'utf8');
      
      const lines = data.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
      const result = lines.slice(1).map(line => {
        const fields = line.split(',').map(field => field.trim());
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = fields[index];
        });
        return obj;
      });
      await CsvModel.insertMany(result);
      res.redirect('allentries');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error processing file');
    }
  } else {
    res.status(400).send('No file uploaded');
  }
});
//assigning the barcode to every order
app.post('/assigncode', async (req, res) => {
  try {
    const { barcode, entryId } = req.body;
    console.log('Scanned barcode:', barcode);
    if (barcode) {
      await CsvModel.findByIdAndUpdate(entryId, { assignedBarcode: barcode, isPacked: true });
      console.log('Barcode assigned successfully:', barcode);
    } else {
      await CsvModel.findByIdAndUpdate(entryId, { assignedBarcode: null, isPacked: false });
      console.log('No barcode provided, isPacked set to false');
    }
    res.redirect("/allentries");
  } catch (error) {
    console.error('Error assigning barcode:', error);
    res.status(500).send('Error assigning barcode');
  }
});
//assigning the delivery boy to every order
app.post("/assigndeliveryboy", async (req, res)=>{

  try {
    const {captain, entryId} = req.body;
    console.log(captain);
    await CsvModel.findByIdAndUpdate(entryId, {deliveredBy:captain});
    res.redirect("allentries");
  } catch (error) {
    console.log(error);
    res.status(500);
  }
    
});
//submiting the status of delivery
app.post("/isDelivered", async(req, res) =>{
  try {
    const {delivereditems} = req.body;
    const deliveryStatus = await CsvModel.findOneAndUpdate({ assignedBarcode : delivereditems },{isDelivered : true, isReturned:false}, {new : true});
    res.redirect("isDelivered");
    console.log(deliveryStatus);
  } catch (error) {
    console.log(error); 
  }
});
//undo the status of delivery
app.post("/isUndelivered", async(req, res) =>{
  try {
    const {undelivereditems} = req.body;
    const undeliveryStatus = await CsvModel.findOneAndUpdate({ assignedBarcode : undelivereditems },{isDelivered:false}, {new : true});
    console.log(undeliveryStatus);
    res.redirect("isDelivered");
  } catch (error) {
    console.log(error); 
  }
});
//submiting the status of returned items
app.post("/isReturned", async(req, res)=>{
  try {
    const {returnedItems} = req.body;
    const returnedStatus = await CsvModel.findOneAndUpdate(
      {assignedBarcode : returnedItems}, 
      {isDelivered:false, isReturned : true}, 
      {new : true});
      res.redirect("isReturned")
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server Started on Port Number : ${port}`);
});
