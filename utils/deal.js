const { Hand, Bet, Table, TablePlayer, User, Card } = require('../models');
const sequelize = require('../config/connection');
const { QueryTypes } = require('sequelize');

const createHands = async (hands) => {
  try {
    const handData = await Hand.bulkCreate(hands);
    return handData;
  }
  catch (err) {
    return (err);
  }
}

const getTable = async (id) => {
  try {
    const tableData = await Table.findByPk(id, {
      include: [{ model: TablePlayer, include: [{ model: User, attributes: ['id', 'name', 'balance'] }] }]
    })
    return tableData;
  }
  catch (err) {
    return (err);
  }
}

const createBets = async (betAmounts) => {
  try {
    const betData = await Bet.bulkCreate(betAmounts, {
      individualHooks: true,
      returning: true,
    });
    return betData
  }
  catch (err) {
    return (err);
  }
}

const updateBalance = async (user) => {
  try {
    const updatedBalanceData = await User.update(user, {
      where: {
        id: user.id
      },
      fields: ['balance']
    });
    return betData
  }
  catch (err) {
    return (err);
  }
}

const getCard = async (card) => {
  // Check and assign if randomCardIndex does not exist
  try {
    const cardData = await Card.create(card);
    return cardData;
  }
  catch (err) {
    return err;
  }
}

// getUnqiueCard
const getUniqueCard = async (tableId) => {
  try {
    // Check and assign if randomCardIndex does not exist
    let randomCardIndex;
    let doesRandomCardIndexExist = true;
    while (doesRandomCardIndexExist) {
      randomCardIndex = Math.floor(Math.random() * 52);
      const checkRandomCardIndexExist = await sequelize.query("SELECT card_array_index FROM card JOIN hand ON card.hand_id = hand.id JOIN bet ON bet.id = hand.bet_id JOIN tablePlayer ON tablePlayer.id = bet.table_player_id JOIN `table` ON table.id = tablePlayer.table_id WHERE table.id=? and card.card_array_index=?", {
        replacements: [tableId, randomCardIndex],
        nest: false,
        raw: true,
        type: QueryTypes.SELECT
      });
      if (checkRandomCardIndexExist.length === 0) {
        doesRandomCardIndexExist = false;
      }
    }
    return randomCardIndex;
  }
  catch (err) {
    return err
  }
}

// check if deck can be continued
const isDeckPlayable = async (tableId) => {
  try {
    const allUsedCardsinTable = await Card.count({
      include: [
        {
          model: Hand, include: [
            {
              model: Bet, include: [
                {
                  model: TablePlayer, include: [
                    {
                      model: Table, where: {
                        id: tableId
                      }
                    }
                  ],
                },
              ]
            },
          ]
        },
      ]
    })

    if (52 - allUsedCardsinTable < 10) {
      return false;
    }
    else {
      return true;
    }
  }
  catch (err) {
    return err;
  }
}

module.exports = {
  createHands,
  getTable,
  createBets,
  getUniqueCard,
  getCard,
  isDeckPlayable
};