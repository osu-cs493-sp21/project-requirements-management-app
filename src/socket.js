const { Op } = require('sequelize');

const getCondition = (column, query) => ({
  [column]: {
    [Op.like]: `%${query}%`,
  },
});

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('search', async (query, callback) => {
      const features = await seqFeature.findAll({
        where: {
          [Op.or]: [
            getCondition('title', query),
            getCondition('description', query),
            getCondition('notes', query),
          ],
        },
      });

      const questions = await seqQuestion.findAll({
        where: {
          [Op.or]: [
            getCondition('question', query),
          ],
        },
      });

      const definitions = await seqDefinition.findAll({
        where: {
          [Op.or]: [
            getCondition('type', query),
            getCondition('name', query),
            getCondition('description', query),
          ],
        },
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
