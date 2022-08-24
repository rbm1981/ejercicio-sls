const DYNAMODB = require("aws-sdk/clients/dynamodb");

const dynamodb = new DYNAMODB({
  region: "us-east-1",
});

function giftChoser (birthday){
  const month = parseInt(birthday.split('-')[1]) 
  const day = parseInt(birthday.split('-')[2]) 
  
  let gift
  
  if(month >= 1 && month <= 3 ){
    if (month === 3 && day >= 21){
      gift = 'Buzo'
    } else {
      gift = 'Remera'
    }
  }
  
  if(month >= 4 && month <= 6 ){
    if (month === 6 && day >= 21){
      gift = 'Sweater'
    } else {
      gift = 'Buzo'
    }
  }
  
  if(month >= 7 && month <= 9 ){
    if (month === 9 && day >= 21){
      gift = 'Camisa'
    } else {
      gift = 'Sweater'
    }
  }
  
  if(month >= 10 && month <= 12 ){
    if (month === 12 && day >= 21){
      gift = 'Remera'
    } else {
      gift = 'Camisa'
    }
  }

  return gift
}

module.exports.handler = async (event) => {
  const queue = event.Records.map((record) => record.body);

  for (const item of queue) {
      const message = JSON.parse(item)
      const body = JSON.parse(message.Message) 

    const dbParams = {
      ExpressionAttributeNames: {
        "#G": "gift",
      },
      ExpressionAttributeValues: {
        ":g": {
          S: giftChoser(body.birth),
        },
      },
      Key: {
        "dni": {
          S: body.dni,
        },
      },
      ReturnValues: "ALL_NEW",
      TableName: process.env.CLIENTS_TABLE,
      UpdateExpression: "SET #G = :g",
    };

    try {
      const dbResult = await dynamodb.updateItem(dbParams).promise();
      console.info(dbResult);
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: error,
      };
    }
  }

  return {
    statusCode: 200,
    body: "Gifts created succesfully",
  };
};
