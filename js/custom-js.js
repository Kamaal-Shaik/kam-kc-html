$(function () {
    $( "#datepicker_from" ).datepicker({
        dateFormat: 'dd-mm-yy'
    });
    
    $( "#datepicker_to" ).datepicker({
        dateFormat: 'dd-mm-yy'
    });
    
    $("#btn_load_balancesheet").click(function(){
        var from_date = $( "#datepicker_from" ).val();
        var to_date = $( "#datepicker_to" ).val();
        if (to_date >= from_date){
            get_transactions_between_dates(from_date, to_date);
        }else{
            alert('\'To\' date should be greaterthan or equal to \'From\' date');
        }        
    });    
});


