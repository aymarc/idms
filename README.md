# idms


## Description
Index DB Management Script (IDBMS) is a light weight wrapper for indexdb
that facilitates the use of index db and reduce repetition apparent in the 
process of using Index DB.
The solution is simple and OOP based. Can easily be extended or embedded into
a larger system.

## Usage
Check the Example folder for more other examples

```javascript
 import IDBMS from "/index.js";

(async () => {

    const bdb = new IDBMS(); //initialize browser db
    if (!bdb) {
        throw new Error("IDMS not initialized");
    }
    //save data
    await bdb.setItem("auth", "7yb09sgwkuoiw.shdtqnkpodhyiabetyd.10", true);

    //retrieve data
    const auth_key = await bdb.getItem("auth");
    console.log("auth_key ", auth_key);

    //delete data
    await bdb.delItem("auth");
})()
```


