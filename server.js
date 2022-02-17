const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/library_books');
const express = require('express');
const app = express();
//const db = require('./db');

const STRING = Sequelize.STRING;

const Genre = sequelize.define('genre', {
    name: {
        type: STRING,
        allowNull: false
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
    },
    author: {
        type: STRING,
        allowNull: false
    }
});

Book.belongsTo(Genre);
Genre.hasMany(Book);

app.get('/', (req, res) => res.redirect('books'));

app.get('/books/', async(req, res, next) => {
    try {
        const books = await Book.findAll({
            include: [ Genre ]
        });

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
            <body>
                <h1>Books</h1>
                ${html}
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
                <ul>
                    ${book.title}
                </ul>
            `
        }).join('');

        res.send(`
            <html>
                <body>
                    <h1>${genre.name}</h2>
                    <div>
                        ${html}
                    </div>
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