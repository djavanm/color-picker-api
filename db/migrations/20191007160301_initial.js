exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('users', table => {
      table.increments('id').primary();
      table.string('email');
      table.string('password');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('projects', table => {
      table.increments('id').primary();
      table.string('name');
      table.integer('user_id').unsigned();
        table.foreign('user_id').references('users.id');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('palettes', table => {
      table.increments('id').primary();
      table.string('name');
      table.string('hex_codes');
      table.integer('project_id').unsigned();
        table.foreign('project_id').references('projects.id');
      table.timestamps(true, true);
    })
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('palettes'),
    knex.schema.dropTable('projects'),
    knex.schema.dropTable('users')
  ])
};
