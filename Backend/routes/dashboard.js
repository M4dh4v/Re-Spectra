const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const  StudentDetail=require('../models/studentDetails');
const router = express.Router();


router.use(bodyParser.json());
router.post('/profile', async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; 
  // console.log(token)
  if (!token) {
    return res.status(400).json({ error: 'Token is missing' });
  }

  try {
    const response = await axios.get('https://kmit-api.teleuniv.in/studentmaster/studentprofile/4135',{
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    

    const profileData = response.data.payload.student;

    if (!profileData.htno) {
      return res.status(400).json({ error: 'Invalid response from external API' });
    }


    let x = response.data.payload.studentimage;

    profileData.picture = x.split(',')[1];

    res.json(profileData);
  } catch (apiError) {
    console.error('Error fetching profile data from external API:', apiError);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post('/userinfo', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const id = req.body?.id;

  if (!token) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }
  if (!id) {
    return res.status(400).json({ error: 'Missing id in request body' });
  }

  const upstreamUrl = `https://kmit-api.teleuniv.in/studentmaster/studentprofile/${encodeURIComponent(id)}`;

  try {
    const upstreamResp = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // if upstream returned non-2xx, forward status + message
    const upstreamText = await upstreamResp.text();
    let upstreamJson;
    try {
      upstreamJson = JSON.parse(upstreamText);
    } catch (e) {
      // upstream returned non-JSON (keep raw text)
      upstreamJson = null;
    }

    if (!upstreamResp.ok) {
      console.error('Upstream API error:', upstreamResp.status, upstreamText);
      return res.status(upstreamResp.status).json({
        error: 'Upstream API error',
        status: upstreamResp.status,
        details: upstreamJson || upstreamText,
      });
    }

    // successful upstream response
    const userData = upstreamJson?.payload?.student;
    if (!userData) {
      console.error('Upstream response missing payload.student:', upstreamJson);
      return res.status(502).json({ error: 'Invalid upstream response format' });
    }

    // return student object to client
    return res.json(userData);
  } catch (apiError) {
    console.error('Error fetching user data from back-end API:', apiError);
    return res.status(502).json({ error: 'Bad Gateway', details: apiError.message });
  }
});

router.post('/attendance', async (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
    try {
      // console.log(token)

      const response = await fetch('https://kmit-api.teleuniv.in/sanjaya/getAttendance', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

      const xx = await response.json()

      // console.log(xx);
      const data = xx.payload.attendanceDetails;
      const data1 = xx.payload.overallAttendance;
  
      
      const attendanceData = {
        dayObjects: data,
        totalPercentage: data1,
      };
  
      
      res.json(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance data from external API:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  




module.exports = router;
