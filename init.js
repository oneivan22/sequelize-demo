const sequelize = require('./database');
const { Author, Book } = require('./models');

async function init() {
  try {
    await sequelize.sync({ force: true });
    console.log('Таблицы синхронизированы.');

    const author = await Author.create({
      name: 'Джоан Роулинг',
      country: 'Великобритания',
    });

    await author.createBook({
      title: 'Гарри Поттер и философский камень',
      year: 1997,
      genre: 'Фэнтези',
    });

    await author.createBook({
      title: 'Гарри Поттер и Тайная комната',
      year: 1998,
      genre: 'Фэнтези',
    });

    const authorsWithBooks = await Author.findAll({
      include: [{
        model: Book,
        as: 'books',
      }],
    });

    authorsWithBooks.forEach((a) => {
      console.log(`Автор: ${a.name} (${a.country})`);
      a.books.forEach((b) => {
        console.log(`  - ${b.title} (${b.year} г., ${b.genre})`);
      });
    });

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await sequelize.close();
  }
}

init();