const sequelize = require('./database');
const { Op } = require('sequelize');
const { Author, Book } = require('./models');
const { User, Post, Student, Course, Enrollment, Order, Item } = require('./models-advanced');

async function seed() {
  await sequelize.sync({ force: true });

  const u1 = await User.create({ name: 'Анна', email: 'anna@mail.ru', isActive: true });
  const u2 = await User.create({ name: 'Борис', email: 'boris@mail.ru', isActive: true });
  const u3 = await User.create({ name: 'Иван', email: 'ivan@mail.ru', isActive: false });

  await Post.create({ title: 'Первый пост Анны', publishedAt: '2024-05-10', status: 'published', authorId: u1.id });
  await Post.create({ title: 'Второй пост Анны', publishedAt: '2024-06-15', status: 'published', authorId: u1.id });
  await Post.create({ title: 'Пост Бориса', publishedAt: '2024-03-20', status: 'published', authorId: u2.id });
  await Post.create({ title: 'Старый пост Бориса', publishedAt: '2022-01-01', status: 'draft', authorId: u2.id });
  await Post.create({ title: 'Черновик Ивана', publishedAt: '2024-01-01', status: 'draft', authorId: u3.id });

  const a1 = await Author.create({ name: 'Джоан Роулинг', country: 'Великобритания' });
  const a2 = await Author.create({ name: 'Стивен Кинг', country: 'США' });
  await Author.create({ name: 'Иван Без Книг', country: 'Россия' });

  await Book.create({ title: 'Гарри Поттер', year: 1997, genre: 'Фэнтези', authorId: a1.id });
  await Book.create({ title: 'Оно', year: 1986, genre: 'Хоррор', authorId: a2.id });

  const s1 = await Student.create({ name: 'Петя', group: 'И-21' });
  const s2 = await Student.create({ name: 'Маша', group: 'И-22' });

  const c1 = await Course.create({ title: 'Математика', credits: 5 });
  const c2 = await Course.create({ title: 'Физкультура', credits: 2 });
  const c3 = await Course.create({ title: 'Программирование', credits: 6 });

  await s1.addCourses([c1, c2]);
  await s2.addCourses([c1, c3]);

  const o1 = await Order.create({ number: '001', status: 'paid' });
  const o2 = await Order.create({ number: '002', status: 'new' });

  await Item.create({ productName: 'Ноутбук', quantity: 1, price: 50000, orderId: o1.id });
  await Item.create({ productName: 'Мыши', quantity: 5, price: 500, orderId: o1.id });
  await Item.create({ productName: 'Клавиатуры', quantity: 3, price: 2000, orderId: o2.id });
  await Item.create({ productName: 'Монитор', quantity: 1, price: 15000, orderId: o2.id });
}

async function task1() {
  console.log('\n=== Задание 1: Пользователи с постами после 2023-01-01 ===');
  const users = await User.findAll({
    include: [{
      model: Post,
      as: 'posts',
      where: { publishedAt: { [Op.gt]: '2023-01-01' } },
      required: true,
    }],
    order: [
      ['name', 'ASC'],
      [{ model: Post, as: 'posts' }, 'publishedAt', 'DESC'],
    ],
  });
  users.forEach((u) => {
    console.log(`Пользователь: ${u.name}`);
    u.posts.forEach((p) => console.log(`  - ${p.title} (${p.publishedAt})`));
  });
}

async function task2() {
  console.log('\n=== Задание 2: Все авторы (включая без книг) ===');
  const authors = await Author.findAll({
    include: [{
      model: Book,
      as: 'books',
      required: false,
    }],
    order: [['name', 'ASC']],
  });
  authors.forEach((a) => {
    console.log(`Автор: ${a.name}`);
    if (a.books.length === 0) {
      console.log('  (нет книг)');
    } else {
      a.books.forEach((b) => console.log(`  - ${b.title}`));
    }
  });
}

async function task3() {
  console.log('\n=== Задание 3: Студенты на курсах с credits > 3 ===');
  const students = await Student.findAll({
    include: [{
      model: Course,
      as: 'courses',
      where: { credits: { [Op.gt]: 3 } },
      required: true,
      through: { attributes: [] },
    }],
    order: [
      ['name', 'ASC'],
      [{ model: Course, as: 'courses' }, 'title', 'ASC'],
    ],
  });
  students.forEach((s) => {
    console.log(`Студент: ${s.name}`);
    s.courses.forEach((c) => console.log(`  - ${c.title} (${c.credits} кредитов)`));
  });
}

async function task4() {
  console.log('\n=== Задание 4: Заказы с товарами quantity > 2 ===');
  const orders = await Order.findAll({
    include: [{
      model: Item,
      as: 'items',
      where: { quantity: { [Op.gt]: 2 } },
      required: true,
    }],
    order: [
      ['createdAt', 'DESC'],
      [{ model: Item, as: 'items' }, 'price', 'DESC'],
    ],
  });
  orders.forEach((o) => {
    console.log(`Заказ #${o.number} (${o.status})`);
    o.items.forEach((i) => console.log(`  - ${i.productName} x${i.quantity} по ${i.price} руб.`));
  });
}

async function task5() {
  console.log('\n=== Задание 5: Активные пользователи с опубликованными постами ===');
  const users = await User.findAll({
    where: { isActive: true },
    include: [{
      model: Post,
      as: 'posts',
      where: { status: 'published' },
      required: true,
    }],
    order: [
      ['name', 'ASC'],
      [{ model: Post, as: 'posts' }, 'createdAt', 'DESC'],
    ],
  });
  users.forEach((u) => {
    console.log(`Пользователь: ${u.name} (активен: ${u.isActive})`);
    u.posts.forEach((p) => console.log(`  - ${p.title} [${p.status}]`));
  });
}

async function run() {
  try {
    await seed();
    await task1();
    await task2();
    await task3();
    await task4();
    await task5();
  } catch (e) {
    console.error('Ошибка:', e);
  } finally {
    await sequelize.close();
  }
}

run();