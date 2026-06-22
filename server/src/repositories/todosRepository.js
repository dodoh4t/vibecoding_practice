const db = require('../db/pool');

async function listTodos({ userId, completed, sort, from, to }) {
  const params = [userId];
  const conditions = ['user_id = $1'];

  if (completed !== undefined) {
    params.push(completed);
    conditions.push(`is_completed = $${params.length}`);
  }

  if (from) {
    params.push(from);
    conditions.push(`due_date >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    conditions.push(`due_date <= $${params.length}`);
  }

  const orderDirection = sort === 'createdAtAsc' ? 'ASC' : 'DESC';

  const result = await db.query(
    `SELECT id, user_id, content, is_completed, due_date, created_at, updated_at
     FROM public.todos
     WHERE ${conditions.join(' AND ')}
     ORDER BY due_date ${orderDirection}, created_at ${orderDirection}, id ${orderDirection}`,
    params
  );

  return result.rows;
}

async function createTodo({ userId, content, dueDate }) {
  const result = await db.query(
    `INSERT INTO public.todos (user_id, content, due_date)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, content, is_completed, due_date, created_at, updated_at`,
    [userId, content, dueDate]
  );

  return result.rows[0];
}

async function updateTodoCompletion({ todoId, userId, isCompleted }) {
  const result = await db.query(
    `UPDATE public.todos
     SET is_completed = $1,
         updated_at = NOW()
     WHERE id = $2
       AND user_id = $3
     RETURNING id, user_id, content, is_completed, due_date, created_at, updated_at`,
    [isCompleted, todoId, userId]
  );

  return result.rows[0] || null;
}

async function deleteTodo({ todoId, userId }) {
  const result = await db.query(
    `DELETE FROM public.todos
     WHERE id = $1
       AND user_id = $2`,
    [todoId, userId]
  );

  return result.rowCount > 0;
}

module.exports = {
  listTodos,
  createTodo,
  updateTodoCompletion,
  deleteTodo
};
