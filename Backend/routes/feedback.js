const express = require('express');
const  Feedback=require('../models/feedback');
const axios = require('axios');
const  StudentDetail=require('../models/studentDetails');
const { message } = require('statuses');
const router = express.Router();
require('dotenv').config();
const add=async(token)=>{
  try {
      try {
        const response2 = await axios.get('https://kmit-api.teleuniv.in/studentmaster/studentprofile/4135', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      const profileData = response2.data.payload.student;
      console.log(profileData);
      return profileData;
    } catch (apiError) {
      console.error('Error fetching user data from back-end API:', apiError);
  }}
  catch(error){
    console.error('Error fetching user data from back-end API:', apiError);
  }
}

router.post('/def-token-register', async (req, res) => {
  const {phnumber}=req.body;
  const {password} = req.body;
  console.log(req.body);
  const student=await StudentDetail.findOne({ phone: phnumber});
  if(student!=null){
    return res.status(201).json({message:`Student "${student.firstname}" is already part of spectra`});
  }

  try {
      const response = await axios.post('https://kmit-api.teleuniv.in/auth/login', {
          username: phnumber,
          password: password,
          application: "sanjaya"
      }, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
      console.log(response.data);
      try {
        if (response.data.Error == false) {
            const token = response.data.access_token; 
            const data22=await add(token);
            const ob = await StudentDetail.find({htno: data22.htno});
            if (ob){
              return res.status(201).json({ error: 'Already Registered' });
            }
            data22.password=password;
            const student = new StudentDetail(data22);
            await student.save();
            console.log("hellobaby");
            return res.status(200).json({name:data22.firstname});
        }else{
          return res.status(500).json({ error: 'Error fetching profile views from database' });
        }
      } catch (dbError) {
        console.error('Error fetching profile views from external database:', dbError);
        return res.status(500).json({ error: 'Error fetching profile views from database' });
      }
      // return res.status(200).json(response.data);
      
  } catch (error) {
      console.error('Error fetching token  with Default Password:', error);
      res.status(500).json({ error: 'Failed to fetch token from Sanjaya API with Default Password' });
  }
});


module.exports = router;