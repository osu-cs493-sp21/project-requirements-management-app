## SQL
Run the docker compose file

## Node app
Open the `/src/` folder    
Run `npm install`    
Install pm2 with `npm install -g pm2` (Run as admin)    
Run the node app with `pm2 start pm2.json`    
pm2 will watch for changes and restart, it will log everything to `src/logs/combined.log`    


## Other Info 
Sequelize models should be fully working    
A few routes and postman tests demonstrate the basics    
    
You can find some examples of Sequelize usage in this repo:    
    
https://github.com/barrar/sequelize-jwt-demo/blob/main/src/api/businesses.js#L34    
`const pageBusinesses = await seqBusiness.findAll({ offset: start, limit: numPerPage })`    
    
https://github.com/barrar/sequelize-jwt-demo/blob/main/src/api/businesses.js#L80    
`findResult = await seqBusiness.findByPk(businessid, { include: [seqReview, seqPhoto] })`    

https://github.com/barrar/sequelize-jwt-demo/blob/main/src/api/photos.js#L17    
`let createResult = await seqPhoto.create(photo)`    