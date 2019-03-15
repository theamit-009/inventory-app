var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();

app.set('port', process.env.PORT || 5000);

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/update', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        conn.query(
            'UPDATE salesforce.Product__c SET Product_Name__c = $1 WHERE LOWER(Quantity__c) = LOWER($2) AND LOWER(Cost_Per_Product__c) = LOWER($3)',
            [req.body.productname.trim(), req.body.quantity.trim(), req.body.costperproduct.trim()],
            function(err, result) {
                if (err != null || result.rowCount == 0) {
                  conn.query('INSERT INTO salesforce.Product__c (Product_Name__c, Quantity__c, Cost_Per_Product__c) VALUES ($1, $2, $3)',
                  [req.body.productname.trim(), req.body.quantity.trim(), req.body.costperproduct.trim()],
                  function(err, result) {
                    done();
                    if (err) {
                        res.status(400).json({error: err.message});
                    }
                    else {
                        // this will still cause jquery to display 'Record updated!'
                        // eventhough it was inserted
                        res.json(result);
                    }
                  });
                }
                else {
                    done();
                    res.json(result);
                }
            }
        );
    });
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});