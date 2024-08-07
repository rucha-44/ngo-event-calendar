import { dirname } from 'path'
import { fileURLToPath } from 'url'
import express, { response } from 'express'
import path from 'path'
import * as db from './database.js'

import { getLogins,getLogin,createLog, checkLog,
  getEvents,getEvent,createEvent, deleteEvent, 
  getVolunteers, getVolunteer, createVolInterest, deleteVolunteer,
  getInventories, getInventory, createInventory, deleteInventory,
  getFeedbacks, getFeedback, createFeedback, deleteFeedback 
 } from './database.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));


app.post('/login', async (req, res) => {
  const { username, pass } = req.body;
  try {
    const exists = await checkLog(username, pass)
    if (exists) {
      return res.json({ redirect: '/volIndex.html'})
    }
    else {
      return res.status(409).json({ message: "Login Failed! User does not exist" })
    }
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
  }
});

app.post('/registeration', async (req, res) => {
  const { email, password } = req.body;
  try {
    const exists = await createLog(email, password)
    console.log(exists)
    if (exists) {
      return res.json({ redirect: '/volIndex.html'})
    }
    else {
      return res.status(409).json({ message: "Login Failed! User does not exist" })
    }
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' })
  }
});

app.post('/addevent', async (req, res) => {
  const { ename, edate, evenue, edetails } = req.body;
  try {
    const eid = await createEvent(ename, edate, evenue, edetails)
    if(eid)
      return res.redirect('/volIndex.html')
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error, failed to create event' })
  }
})

app.post('/addinventory', async (req, res) => {
  const { iname, iquantity, cost } = req.body;
  try {
    const invid = await createEvent(iname, iquantity, cost)
    if(invid)
      return res.redirect('/volIndex.html')
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error, failed to create event' })
  }
})

app.post('/addvolunteers', async (req, res) => {
  const { vname, vemail, vpno} = req.body;
  
  try {
    const volID = await createVolInterest(vname, vemail, vpno);
    
    if (volID>0) {
      return res.json({ redirect: '/index.html' });
    } else {
      throw new Error('Failed to create volunteer');
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Internal Server Error. Failed to add volunteer.' });
  }
})

app.get('/invstats', async (req, res) => {
  try {
    const inv = await db.sumOfInventory();
    const events = await db.sumOfEvents();
    const cost = await db.costperyear();
    res.json({
      inv,
      events,
      cost
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.get('/indexstats', async (req, res) => {
  try {
    const events = await db.sumOfEvents();
    const vols = await db.sumOfVolunteers();
    res.json({
      events,
      vols
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.delete('/events/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteEvent(id);
    if (result) {
      res.json({ message: result });
    } else {
      res.status(404).json({ error: 'Event not found' }); // ID does not match any record
    }
  } catch (error) {
    console.error('Error deleting event:', error); // Log specific error details
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});



app.get('/events', async (req, res) => {
  try {
    const events = await getEvents();
    //console.log(events)
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.get('/inventory', async (req, res) => {
  try {
    const inv = await getInventories();
    res.json(inv);
  } catch (error) {
    console.error('Error fetching inventory list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.get('/volunteers', async (req, res) => {
  try {
    const vol = await getVolunteers();
    res.json(vol);
  } catch (error) {
    console.error('Error fetching volunteer list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

app.listen(8080, () => {
    console.log('Server is running on port 8080')
})