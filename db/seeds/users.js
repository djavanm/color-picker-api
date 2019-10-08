const users = [
  {
    email: "steve@gmail.com",
    password: "12345",
    projects: [
      {
        name: "Project 1",
        palettes: [
          {
            name: "Warm Colors",
            hex_codes: "#FFFFFF,#000000,#808080,#A9A9A9,#FF0000"
          },
          {
            name: "Cool Colors",
            hex_codes: "#FFFFFF,#000000,#808080,#A9A9A9,#FF0000"
          }
        ]
      }
    ]
  },
  {
    email: "bob@gmail.com",
    password: "12345",
    projects: [
      {
        name: "Project 1",
        palettes: [
          {
            name: "Bland Colors",
            hex_codes: "#FFFFFF,#000000,#808080,#A9A9A9,#FF0000"
          },
          {
            name: "Awesome Colors",
            hex_codes: "#FFFFFF,#000000,#808080,#A9A9A9,#FF0000"
          }
        ]
      },
      {
        name: "Project 2",
        palettes: [
          {
            name: "Rad Colors",
            hex_codes: "#FFFFFF,#000000,#808080,#A9A9A9,#FF0000"
          },
          {
            name: "Dope Colors",
            hex_codes: "#FFFFFF,#000000,#808080,#A9A9A9,#FF0000"
          }
        ]
      }
    ]
  }
];

const createUser = (knex, user) => {
  return knex('users').insert({
    email: user.email,
    password: user.password
  }, 'id')
    .then(userId => {
      let projectPromises = user.projects.reduce((acc, project) => {
        acc.push(createProject(knex, {...project, user_id: userId[0]}))
        return acc
      }, [])
      return Promise.all(projectPromises)
    })
}

const createProject = (knex, project) => {
  return knex('projects').insert({
    name: project.name,
    user_id: project.user_id
  }, 'id')
  .then(projectId => {
    let palettePromises = project.palettes.reduce((acc, palette) => {
      acc.push(createPalette(knex, { ...palette, project_id: projectId[0] }))
      return acc
    }, [])
    return Promise.all(palettePromises)
  })
}

const createPalette = (knex, palette) => {
  return knex('palettes').insert(palette)
}

exports.seed = knex => {
  return knex("palettes")
    .del()
    .then(() => knex("projects").del())
    .then(() => knex("users").del())
    .then(() => {
      let userPromises = users.reduce((acc, user) => {
        acc.push(createUser(knex, user))
        return acc
      }, [])
      return Promise.all(userPromises)
    })
    .catch(error => console.log(`Error seeding data: ${error}`))
};
