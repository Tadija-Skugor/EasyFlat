const express = require('express');
const router = express.Router();
const pool = require('../db'); 

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT stan_id from stan WHERE zauzet = FALSE'); 
    console.log(result);
    res.json(result.rows);
  } catch (err) {
    console.log("Keksic");
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/zgrade', async (req, res) => {
  try {
    if (!req.session || !req.session.email) {
      return res.status(400).json({ message: 'User is not authenticated' });
    }

    const userEmail = req.session.email;

    let query = `
        SELECT
          z.id AS zgrada_id,
          z.naziv_zgrade,
          z.slika_link,
          COALESCE(
            JSON_AGG(
              CASE 
                WHEN k.email IS NOT NULL THEN JSON_BUILD_OBJECT(
                  'ime', k.Ime,
                  'prezime', k.Prezime,
                  'email', k.email,
                  'suvlasnik', k.suvlasnik, 
                  'aktivan', k.aktivan
                )
                ELSE NULL
              END
            ) FILTER (WHERE k.email IS NOT NULL), 
            '[]'
          ) AS korisnici
        FROM
          zgrade z
        LEFT JOIN
          korisnik k ON z.id = k.zgrada_id
        GROUP BY
          z.id, z.naziv_zgrade, z.slika_link;
    `;

    const result = await pool.query(query);

    // Filter buildings based on user email
    const filteredBuildings =
      userEmail === 'easyflatprogi@gmail.com'
        ? result.rows // Admin sees all buildings
        : result.rows.filter(building =>
            building.korisnici.some(user => user.email === userEmail)
          ); // Regular user sees their associated buildings only

    res.json(filteredBuildings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.post('/zgrade', async (req, res) => {
  try {
    console.log('Received request to add a building:', req.body);
    const { id, naziv_zgrade, slika_link } = req.body;
    await pool.query(
      'INSERT INTO zgrade (id, naziv_zgrade, slika_link) VALUES ($1, $2, $3)',
      [id, naziv_zgrade, slika_link]
    );
    console.log('Building added successfully:', req.body);
    res.status(201).send('Building added');
  } catch (err) {
    console.error('Error adding building:', err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/zgrade/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { naziv_zgrade, slika_link } = req.body;
    await pool.query(
      'UPDATE zgrade SET naziv_zgrade = $1, slika_link = $2 WHERE id = $3',
      [naziv_zgrade, slika_link, id]
    );
    res.status(200).json({ message: 'Building updated' });
  } catch (err) {
    console.error('Error updating building:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});




// Example POST route to insert new data
router.post('/contact', async (req, res) => {
  console.log("Received contact data");

  const { email, website, poruka } = req.body;
  const slanjeUpita = await pool.query(`insert into UPIT (emailOsobe,Tekst,zgrada_id) VALUES ('${email}','${poruka}',$1)`,[req.session.zgrada_id]); 
  

  try {


    //const query = 'INSERT INTO your_table_name (email, website, poruka) VALUES ($1, $2, $3) RETURNING *';
    //const values = [email, website, poruka];

    //const result = await pool.query(query, values);
    console.log(`${email} : ${poruka} | ${website}`);
    if (!poruka) {
      return res.send("Nije upisana poruka"); // Use return to stop execution here
    }    
    res.send("Hvala Vam i LP");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  console.log("Primili smo login podatke YIPPIE");

  const { email, sifra } = req.body;
  try {

    console.log(`${email} : ${sifra}`);
    if (!email) {
      return res.send("Nije upisan email");
    }  
    
    const result = await pool.query(
      'SELECT * FROM korisnik WHERE email = $1 AND lozinka = $2',
      [email, sifra]
    );
    if (result.rows.length > 0) {
      res.send("Login Uspješan");
    } else {
      res.status(401).send("Pogrešan email ili sifra.");
    }  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;

/*router.post('/addSignupInfo', async(req,res) => {        //dodavanje korisnika u bazu, bez potvrde administratora
  try{              
    const stanovi = req.body.stanovi;       
    const password = req.body.password;
    const query = `INSERT INTO ${process.env.TABLE} (ime, prezime, email, password, stanovi, authorized, role)
                  VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`; 
    const values = [req.session.name,req.session.surname,'primjer@mail.com',req.body.stanovi,FALSE,'suvlasnik'];
    const result = await pool.query(query, values);
    console.log("Korisnik dodan u bazu, ali ne potvrđen od admina");
    res.send("Hvala na prijavi, admninistrator će u nekoliko dana pregledati i potvrditi prijavu :D");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})
*/




