const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/library_books');
const express = require('express');
const app = express();
const methodOverride = require('method-override');

const STRING = Sequelize.STRING;

const Genre = sequelize.define('genre', {
    name: {
        type: STRING,
        allowNull: false,
    }
});

const Book = sequelize.define('book', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    title: {
        type: STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    author: {
        type: STRING,
        allowNull: false
    }
});

Book.belongsTo(Genre);
Genre.hasMany(Book);

app.use(methodOverride('_method'));

app.get('/', (req, res) => res.redirect('books'));

app.delete('/books/:id', async(req, res, next) => {
    try {
        const book = await Book.findByPk(req.params.id);
        await book.destroy();
        res.redirect(`/books/${book.genreId}`);
    }
    catch(err) {
        next(err)
    }
});

app.post('/books', async(req, res, next) => {
    try {
        const book = await Book.create(req.body);
        res.redirect(`/books/${book.genreId}`);
    }
    catch(err) {
        next(err)
    }
});

app.get('/books', async(req, res, next) => {
    try {
        const books = await Book.findAll({
            include: [ Genre ]
        });

        const genres = await Genre.findAll();

        const options = genres.map( genre => {
            return `<option value ='${genre.id}'>${genre.name}</option>`;
        }).join('');

        const html = books.map( book => {
            return `
                <div>
                    ${book.title} By: ${book.author}
                    <a href='/genres/${book.genreId}'>${book.genre.name}</a>
                </div>
            `
        }).join('');
        
        res.send(`
        <html>
            <head>
                <title> Friendly Neighborhood Library </title>
            </head>
            <body>
                <h1> Friendly Neighborhood Library </h1>
                <h2> Fiction Section </h2>
                <form method='POST'>
                    <input name='title' placeholder='Book Title' />
                    <input name='author' placeholder='Author' />
                    <select name='genreId'> ${options} </select>
                    <button> Return Book </button>
                </form>
                <div>
                        <ul>
                            ${html}
                        </ul>
                </div>
            </body>
        </html>
        `);
    }
    catch(err) {
        next(err);
    }
});

app.get('/genres/:id', async(req, res, next) => {
    try {
        const genre = await Genre.findByPk(req.params.id, {
            include: [ Book ]
        });

        const html = genre.books.map( book => {
            return `
            <div>
                <ul>
                    ${book.title} 
                    <form method='POST' action='/books/${book.id}?_method=delete'>
                        <button> Check Out Book </button>
                    </form>
                </ul>
            </div>
            `
        }).join('');

        res.send(`
            <html>
                <body>
                    <h1>${genre.name}</h2>
                    <div>
                        ${html}
                    </div>
                    <button> <a href='/books'> Back </a> </button>
                </body>
            </html>
        `);
    }
    catch(err) {
        next(err)
    }
});


const setup = async() => {
    try {
        await sequelize.sync({ force: true });
        console.log('connected');

        const scienceFiction = await Genre.create({ name: 'Science Fiction' });
        const graphicNovel = await Genre.create({ name: 'Graphic Novel' });
        const fantasy = await Genre.create({ name: 'Fantasy' });
        const fiction = await Genre.create({ name: 'Fiction'  });

        await Book.create({ title: 'Dune', author: 'Frank Herbert', genreId: scienceFiction.id });
        await Book.create({ title: 'Neuromancer', author: 'William Gibson', genreId: scienceFiction.id });
        await Book.create({ title: 'Kindred', author: 'Octavia Butler', genreId: scienceFiction.id });
        await Book.create({ title: 'Uzumaki', author: 'Junji Ito', genreId: graphicNovel.id });
        await Book.create({ title: 'Y The Last Man Vol. 1', author: 'Brian K. Vaughan', genreId: graphicNovel.id });
        await Book.create({ title: 'One Hundred Years Of Solitude', author: 'Gabriel Garcia Marquez', genreId: fiction.id });
        await Book.create({ title: 'Love In The Time Of Cholera', author: 'Gabriel Garcia Marquez', genreId: fiction.id});
        await Book.create({ title: 'Pachinko', author: 'Min Jin Lee', genreId: fiction.id });
        await Book.create({ title: 'The Fifth Season', author: 'N.K. Jemisen', genreId: fantasy.id });

        const port = process.env.PORT || 8080;
        app.listen(port, () => {
            console.log(`listening on port ${port}`)
        })
    }
    catch(err) {
        console.log(err)
    }
};

setup();