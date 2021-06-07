const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require("bcrypt");

global.seq =  new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOSTNAME,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    define: {
        freezeTableName: true,
        timestamps: false
    }
})

global.seqProject = seq.define('project', {
    name: { type: DataTypes.STRING, allowNull: false },
})

global.seqUser = seq.define('user', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    photoPath: { type: DataTypes.STRING, allowNull: true },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(password) { // The password is hashed before storage
            this.setDataValue('password', bcrypt.hashSync(password, 10));
        }
    }
},
{
    defaultScope: {
        attributes: { exclude: ['password'] },
    },
    scopes: {
        includePassword: {}
      }
})

seqUser.prototype.checkPassword = function (password) {
    return bcrypt.compare(password, this.password)
}

global.seqFeature = seq.define('feature', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    notes: { type: DataTypes.STRING, allowNull: true }
})

global.seqQuestion = seq.define('question', {
    question: { type: DataTypes.STRING, allowNull: false }
})

global.seqDefinition = seq.define('definition', {
    type: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    userType: { type: DataTypes.STRING, allowNull: false }
})

// user
seqProject.hasMany(seqUser)
seqUser.belongsTo(seqProject)

// feature
seqProject.hasMany(seqFeature)
seqFeature.belongsTo(seqProject)

// question
seqUser.hasMany(seqQuestion)
seqQuestion.belongsTo(seqUser)
seqFeature.hasMany(seqQuestion)
seqQuestion.belongsTo(seqFeature)

// definition
seqFeature.hasMany(seqDefinition)
seqDefinition.belongsTo(seqFeature)
seqUser.hasMany(seqDefinition)
seqDefinition.belongsTo(seqUser)


// seq.sync({ alter: true})
