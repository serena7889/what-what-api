class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ... this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(lte|lt|gte|gt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  async paginate() {
    const pageSize = this.queryString.limit * 1 || 100;
    const pageNum = this.queryString.page * 1 || 1;
    const skip = (pageNum - 1) * pageSize;
    
    this.query = this.query.skip(skip).limit(pageSize);
    return this;
  }

  sort() {
     if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt');
    }
    return this;

  }

}

module.exports = APIFeatures;