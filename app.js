
//BUDGET  CONTROLLER
var budgetController = (function(){
    
    var Expense = function(id,description,value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome)
    {
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function()
    {
        return this.percentage;
    };

    var Income = function(id,description,value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){  //forEach takes a callback function
            sum = sum + current.value;
        });
        data.totals[type] = sum;
    };

    var data ={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1
    };

    return{
        addItem: function(type,desc,val){
            var newItem,ID;
            
            //[1 2 3 4 5] next ID=6
            //[1 2 4 6 8] next ID=9
            //ID= last ID+1
            //Create new ID
            if(data.allItems[type].length > 0)
            {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID=0;
            }
            

            //Craete new item based on 'inc' or 'exp'
            if(type === 'exp'){
                newItem= new Expense(ID, desc, val);
            }else if(type === 'inc'){
                newItem= new Income(ID, desc, val);
            }

            //Push it into the data structure
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function(current){   //difference between map and forEach is that map always returns a new array
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){     //If no index is not found it returns -1     
                data.allItems[type].splice(index , 1);  //splice has 1st arugument as from where it should start deleting and 2nd how many to be deleted from that point
            }
        },

        calculateBudget: function()
        {
            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the budget: income-expense
            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0)
            {
                //Calculate the percentage of income that we spent
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPer = data.allItems.exp.map(function(cur){   //map is used as we can store the value and return the result
                return cur.getPercentage();
            });
            return allPer;
        },

        getBudget: function()
        {
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
    };

})();



//UI CONTROLLER
var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPerLabel: '.item__percentage',
        dateLabel : '.budget__title--month'
    };

    var formatNumber =  function(num,type){

        var numSplit, int, dec, type;
        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands
        2310.4567 -> + 2,310.46
        2000 -> + 2,000.00
        */
       num = Math.abs(num);
       num = num.toFixed(2);

       numSplit = num.split('.');
       int = numSplit[0];
       if(int.length > 3){
           int = int.substr(0,int.length-3) + ','+ int.substr(int.length-3,3);
       }
       dec = numSplit[1];

       return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback){
        for(var i=0; i<list.length; i++){
            callback(list[i],i);
        }
    };

    return{
        getInput: function()
        {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //Value will either be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }; 
        },

        addListItem: function(obj, type){
            var html, newHtml, element;

            //Create string with placeholder text
            if(type === 'inc')
            {
                element = DOMstrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp')
            {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));

            //Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectionID){
            var el = document.getElementById(selectionID);
            el.parentNode.removeChild(el);    //We have to move up to the parent and then delete the child
        },

        clearFields : function(){
            var fields, fieldArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            //fields return a node list and not array as querySelectorAll returns node list. So we need to convert it to array.

            fieldArr = Array.prototype.slice.call(fields);  //As this is a function we can use call method to pass array as field is a list

            fieldArr.forEach(function(current, index, array)  //current is the element selected, index is length of the array and array is the full array
            {
                current.value = "";
            });

            fieldArr[0].focus();  //This sets the focus to first field i.e.,description

        },

        displayBudget: function(obj){
            var type;
            obj.budget>0 ? type = 'inc' : type = 'exp';
          
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0)
            {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expensesPerLabel);

            nodeListForEach(fields, function(current, index){

                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });

        },

        displayDate: function(){
            var now,year,month,months;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+ year;
        },

        changedType: function(){

            var fields = document.querySelectorAll(DOMstrings.inputType+','+DOMstrings.inputDescription+','+DOMstrings.inputValue);

            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstring: function(){
            return DOMstrings;
        }
    }

})();


//GLOBAL APP CONTROLLER
//Passing arguments means that controller can access both the other controllers and connect them
var controller = (function(budgetCtrl, UICtrl){


    var setupEventListener = function()
    {

        var DOM = UICtrl.getDOMstring();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        //Not only pressing the tick will add the values but if we press enter,then also the value must be saved
        document.addEventListener('keypress',function(event){
        if(event.keyCode === 13 || event.which === 13)
        {
            ctrlAddItem();
        }
        });

        //container is the parent and has all income and expense elements and we do so so that we dont have to add event listener to each of the elements we're interested in
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function()
    {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget in the UI  
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){

        //1. Calculate percentages
        budgetCtrl.calculatePercentages();

        //2. Read percentages from Budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    };


    var ctrlAddItem = function(){

        var input, newItem;

        //1. Get the field input data
        input = UICtrl.getInput();

        //It checks that the input has some real data nand not null or else value will return NaN
        if(input.description!="" && !isNaN(input.value) && input.value >0)
        {
            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to UI
            UICtrl.addListItem(newItem, input.type);

            //4.Clear fields
            UICtrl.clearFields();

            //5.Calculate and update Budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event)  //This event will indicate the target where the event occured
    {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        //inc-1 is returned from itemID and we have to split it
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();
        }
    };

    return{
        init: function(){
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            console.log('App started');
            setupEventListener();
        }
    };

    

})(budgetController,UIController);

controller.init();