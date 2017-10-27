// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

const Cat = models.Cat.CatModel;
const Dog = models.Dog.DogModel;

const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

let lastAdded = new Cat(defaultData);

const readAllCats = (req, res, callback) => Cat.find(callback);
const readAllDogs = (req, res, callback) => Dog.find(callback);

// export the relevant public controller functions
module.exports = {
  index: (req, res) => {
    // res.render takes a name of a page to render.
    res.render('index', {
      currentName: lastAdded.name,
      title: 'Home',
      pageName: 'Home Page',
    });
  },
  page1: (req, res) => {
    readAllCats(req, res, (err, docs) => {
      if (err) res.json({ err });
      return res.render('page1', { cats: docs });
    });
  },
  page2: (req, res) => res.render('page2'),
  page3: (req, res) => res.render('page3'),
  page4: (req, res) => {
    readAllDogs(req, res, (err, docs) => {
      if (err) res.json({ err });
      return res.render('page4', { dogs: docs });
    });
  },
  readCat: (req, res) => {
    Cat.findByName(req.query.name, (err, doc) => {
      if (err) return res.json({ err });
      return res.json(doc);
    });
  },
  getName: (req, res) => res.json({ name: lastAdded.name }),
  setName: (req, res) => {
    const { firstname, lastname, beds } = req.body;
    if (!firstname || !lastname || !beds) {
      return res.status(400).json({ error: 'firstname,lastname and beds are all required' });
    }

    // create a new object of CatModel with the object to save
    const newCat = new Cat({ name: `${firstname} ${lastname}`, bedsOwned: beds });

    newCat.save()
    .then(() => {
      lastAdded = newCat;
      res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned });
    })
    .catch(err => res.json({ err }));

    return res;
  },
  updateLast: (req, res) => {
    lastAdded.bedsOwned++;

    lastAdded.save()
    .then(() => res.json({ name: lastAdded.name, beds: lastAdded.bedsOwned }))
    .catch(err => res.json({ err }));
  },
  searchName: (req, res) => {
    if (!req.query.name) return res.json({ error: 'Name is required to perform a search' });

    return Cat.findByName(req.query.name, (err, doc) => {
      if (err) return res.json({ err });
      if (!doc) return res.json({ error: 'No cats found' });

      return res.json({ name: doc.name, beds: doc.bedsOwned });
    });
  },
  setDog: (req, res) => {
    const { name, breed, age } = req.body;
    if (!name || !breed || !age) {
      return res.status(400).json({ error: 'name, breed and age are all required' });
    }

    // create a new object of DogModel with the object to save
    new Dog({ name, breed, age })
    .save()
    .then(() => res.json({ name, breed, age }))
    .catch(err => res.json({ err }));

    return res;
  },
  searchDog: (req, res) => {
    const { name } = req.query;
    if (!name) return res.json({ error: 'Name is required to perform a search' });
    return Dog.findByName(name, (err, doc) => {
      const dog = doc;
      if (err) return res.json({ err });
      if (!dog) return res.json({ error: 'No dogs found' });

      // Increment dog's age
      dog.age++;
      return dog.save()
      .then(uDog => res.json({ name: uDog.name, breed: uDog.breed, age: uDog.age }))
      .catch(uErr => res.json(uErr));
    });
  },
  notFound: (req, res) => res.status(404).render('notFound', { page: req.url }),
};
