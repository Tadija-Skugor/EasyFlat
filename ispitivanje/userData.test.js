
const pool = require('../db');
const UserController = require('./userData');
const axios = require("axios");
const AxiosMockAdapter = require("axios-mock-adapter");
const mock = new AxiosMockAdapter(axios);


beforeAll(async () => {
    await pool.query("insert into korisnik values ('firstName', 'lastName', 'password', 'example@gmail.com', 3, false)")
    await pool.query("insert into korisnik values ('firstName', 'lastName', 'password', 'example1@gmail.com', 4, true)")
});

test("dodavanje neaktivnog korisnika", async () => {
    mock.onPost("/activate-user", {body: [{ email: 'example@gmail.com ', ime: 'firstName', prezime: 'lastName', stan_id: 3}]});
    const result = await pool.query(
        "SELECT * FROM korisnik WHERE stan_id=3 and aktivan=true"
      );
      expect(result.rowCount).toBe(1)
});

test("deaktiviranje korisničkog računa", async () => {
    mock.onPost("/deactivate-user", {body: [{ email: 'example1@gmail.com ',
         ime: 'firstName', prezime: 'lastName', stan_id: 4}]});
    const result = await pool.query(
        "SELECT * FROM korisnik WHERE stan_id=4 and aktivan=false"
      );
      expect(result.rowCount).toBe(1)
});