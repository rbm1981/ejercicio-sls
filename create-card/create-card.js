const DYNAMODB = require("aws-sdk/clients/dynamodb");

const dynamodb = new DYNAMODB({
  region: "us-east-1",
});

function randomNumber(minimum, maximum){
  return Math.round( Math.random() * (maximum - minimum) + minimum);
}

function calculateAge(birthday) { 
  const birthDate = new Date(birthday)// birthday is a string in format YYYYMMDD
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

module.exports.handler = async (event) => {
  const queue = event.Records.map((record) => record.body);

  for (const item of queue) {
    const message = JSON.parse(item)
    const body = JSON.parse(message.Message)

    const creditCardNumber = `${randomNumber(0000,9999)}-${randomNumber(0000,9999)}-${randomNumber(0000,9999)}-${randomNumber(0000,9999)}`
    const expirationDate = `${randomNumber(01,12)}/${randomNumber(21,35)}`
    const securityCode = `${randomNumber(000,999)}`

    let type = calculateAge(body.birth) > 45 ? 'Gold' : 'Classic'


    const dbParams = {
      ExpressionAttributeNames: {
        "#C": "creditCard",
      },
      ExpressionAttributeValues: {
        ":c": {
          M: {
            "number": {
              S: creditCardNumber,
            },
            "expiration": {
              S: expirationDate,
            },
            "ccv": {
              S: securityCode,
            },
            "type":{
              S: type
            }
          },
        },
      },
      Key: {
        dni: {
          S: body.dni,
        },
      },
      ReturnValues: "ALL_NEW",
      TableName: process.env.CLIENTS_TABLE,
      UpdateExpression: "SET #C = :c",
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
    body: "Cards created succesfully",
  };
};
