class APIFeatures {
    constructor (query, queryString){
      this.query = query //Model.find() it brings up a query
      this.queryString = queryString // the this.queryString obj
    }
    filter(){
      const queryObj = {...this.queryString}
      const exclude = ['limit', 'sort', 'page', 'fields']
      exclude.forEach(element =>delete queryObj[element]);
  
      //advanced filtering
      let queryStr = JSON.stringify(queryObj)
      queryStr = queryStr.replace(/\b(lte|gte|lt|gt)\b/g, match=> `$${match}` )
      
     this.query= this.query.find(JSON.parse(queryStr))
     return this;
    }


    sort(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        }  else{
            this.query = this.query.sort('createdAt')
          }
          return this;
    }

    fieldsLimiting(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        }  else{
            this.query = this.query.select('-__v')
          }
          return this;
    }

    paginate(){
        const page = this.queryString.page *1 || 1 //the wanted page
        const limit = this.queryString.limit *1 || 100 //the number of docs to show in a page
        const skip = (page - 1)* limit //the num of docs to skip in order to reach the wanted page
      
        this.query = this.query.skip(skip).limit(limit)

        return this;
    }
  }
  module.exports= APIFeatures;