function toIso(value) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function formatUser(row) {
  return {
    id: String(row.id),
    email: row.email,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function formatTodo(row) {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    content: row.content,
    isCompleted: row.is_completed,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

module.exports = {
  formatUser,
  formatTodo
};
