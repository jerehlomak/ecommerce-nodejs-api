const agg = [
    {
      '$match': {
        'product': new ObjectId('63f56b4f926b9cfb6f01fa76')
      }
    }, {
      '$group': {
        '_id': null, 
        'averageRating': {
          '$avg': '$rating'
        }, 
        'numOfReviews': {
          '$sum': 1
        }
      }
    }
]