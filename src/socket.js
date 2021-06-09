const { Sequelize } = require('sequelize');

const getCondition = (column, query) =>
  Sequelize.where(
    Sequelize.fn('lower', Sequelize.col(column)),
    { $like: `%${query}%` }
  )


module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('search', async (query, callback) => {
      const features = await seqFeature.findAll({
        $or: [
          getCondition('title', query),
          getCondition('description', query),
          getCondition('notes', query),
        ]
      });

      const questions = await seqQuestion.findAll({
        $or: [
          getCondition('question', query),
        ]
      });

      const definitions = await seqDefinition.findAll({
        $or: [
          getCondition('type', query),
          getCondition('name', query),
          getCondition('description', query),
        ]
      });

      const response = [
        ...features.map(i => ({ ...i.dataValues, entity: 'feature' })),
        ...questions.map(i => ({ ...i.dataValues, entity: 'question' })),
        ...definitions.map(i => ({ ...i.dataValues, entity: 'definition' })),
      ]

      if (callback) callback(response);
    });
  });
};
