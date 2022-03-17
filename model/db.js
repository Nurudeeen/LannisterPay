const mongoose = require('mongoose');
module.exports = {
connect: async () => {try {
  await mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("connected to db");
  });
} catch (error) {
  console.log(error);
}
}
}