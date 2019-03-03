jQuery(document).ready(function($){

    $( "#datepicker_from" ).datepicker({
        dateFormat: 'dd-mm-yy'
    })
    // }).datepicker("setDate", new Date());
    
    $( "#datepicker_to" ).datepicker({
        dateFormat: 'dd-mm-yy'
    });
    // }).datepicker("setDate", new Date());

    $('#datepicker_add_new_tran').datepicker({
        dateFormat: 'dd-mm-yy'
    })
    
    $('.debit_rel').hide();
    $('.dis_sHolder').hide();

    $("#btn_load_balancesheet").click(function(){
        var from_date = $( "#datepicker_from" ).val();
        var to_date = $( "#datepicker_to" ).val();
        if (to_date >= from_date){
            get_transactions_between_dates(from_date, to_date);
        }else{
            alert('\'To\' date should be greaterthan or equal to \'From\' date');
        }        
    });  

    $('#add_new_trans_dialog').dialog({
        open:function(event, ui){
            load_values_in_dropdowns('ddl_transaction_name', 'Select', [], '', '');
            load_values_in_dropdowns('ddl_transaction_employee', 'Select', [], '', '');
            $('#datepicker_add_new_tran').val('');
            $('#ddl_transaction_type').val(0);
            $('#txt_transaction_amount').val('');
            $('#ddl_transaction_paymentType').val(0);        
            $('#ddl_transaction_shareholder').val(0);
            $('#txt_transaction_desc').val(''); 
            $('#spn_balance_to_pay').text('') ;
        },
        title: 'Add New Transaction',
        draggable: true,
        resizable: false,
        closeOnEscape: true,
        modal: true,
        autoOpen: false,
        buttons:[{
                id: 'modal_add_new_trans',
                text: 'Add New Transaction',
                click: add_new_trancation
            },
            {
                id:"btn_cancel_transaction",
                text: "Cancel",
                click: function() {
                    $(this).dialog("close");
                }
            }]
    });

    function add_new_trancation(){
        var trans_date = $('#datepicker_add_new_tran').val();
        var trans_type = $('#ddl_transaction_type').val();
        var acc_type = $('#ddl_transaction_name').val();
        var trans_amount = $('#txt_transaction_amount').val();
        var trans_pType = $('#ddl_transaction_paymentType').val();        
        var trans_paid_by = $('#ddl_transaction_shareholder').val();
        var trans_paying_to = $('#ddl_transaction_employee').val();
        var payee_type = $('#ddl_payee_type').val();
        var trans_desc = $('#txt_transaction_desc').val();
        var bal_to_pay = $('#spn_balance_to_pay').text();
        var data_json = { 
            'date':trans_date, 'transaction_type': parseInt(trans_type), 
            'transaction_name': parseInt(payee_type), 'amount': parseFloat(trans_amount), 
            'payment_type': parseInt(trans_pType), 'paid_share_holder': parseInt(trans_paid_by),
            'employee': parseInt(trans_paying_to), 'description': trans_desc,
            'account_type':acc_type
        }

        if (trans_date != '' && parseInt(trans_type) > 0 && parseInt(acc_type) > 0 && parseFloat(trans_amount) > 0 && parseInt(trans_pType) > 0){
            var valid = false;
            if ((parseInt(trans_type) == 1 || parseInt(trans_type) == 4) && parseInt(trans_paid_by) > 0){
                valid = true;
            }else if (parseInt(trans_type) == 2  && parseInt(payee_type) > 0 && parseInt(trans_paying_to) > 0){
                valid = true;
            }else if (parseInt(trans_type) == 4 && parseInt(payee_type) > 0 && parseInt(trans_paying_to) > 0 && parseInt(trans_paid_by) > 0){
                valid = true;
            }else{
                valid = false;
                alert('Please fill mandatory fields properly.');
            }
            
            if(parseInt(trans_type) == 2 || parseInt(trans_type) == 4){
                if ($('#ddl_payee_type option:selected').text() == 'Other'){
                    if(trans_desc != ''){
                        valid = true;
                    }else{
                        valid = false;
                        alert('If payee type is other must involve the description.')
                    }
                } 
            } 


            if ((parseInt(trans_type) == 2 ||  parseInt(trans_type) == 4) && bal_to_pay != ''){
                var bal_amt = parseFloat(bal_to_pay) - parseFloat(trans_amount);
                if (bal_amt >= 0){                    
                    valid = true;
                }else{
                    var conf_box = confirm('You are paying more than remaining payment. \n You want to process the transaction?')
                    if (conf_box == true) {
                        valid = true;
                    } else {
                        valid = false;
                    }
                }
                // data_json['balance_to_pay'] = bal_amt;
            }
            if (valid == true){
                // alert('inserting.. is in process');
                insert_data(data_json);
            }
        }else{
            alert('Please fill mandatory fields properly.');
        }
    }

    function insert_data(data){
        var url_insert = global_url + 'transactions/insert_new_transactions';
        // alert(JSON.stringify(data));
        var inserted_result = call_ajax('POST', url_insert, data, {'Content-Type':'application/json'});
        if (inserted_result['result'] == 'success'){
            alert('Successfully inserted the record.');
            $('#add_new_trans_dialog').dialog('close');
        }else{
            alert(JSON.stringify(inserted_result['data']));
        }        
    }

    $('#btn_add_new_trans').click(function(){
        $("#datepicker_add_new_tran").datepicker("disable");
        $('#add_new_trans_dialog').dialog('open');
        $("#datepicker_add_new_tran").datepicker("enable");
        var url_for_init = global_url+'transactions/load_initial_data';       
        var init_data = call_ajax('get', url_for_init, {}, {});
        if (init_data['result'] == 'success'){
            load_values_in_dropdowns('ddl_transaction_type', 'Select', init_data['data']['transaction_type'], 'id', 'type');
            load_values_in_dropdowns('ddl_payee_type', 'Select', init_data['data']['employee_types_info'], 'id', 'emp_type');         
            load_values_in_dropdowns('ddl_transaction_name', 'Select', init_data['data']['account_types_info'], 'id', 'type');
            load_values_in_dropdowns('ddl_transaction_paymentType', 'Select', init_data['data']['payment_type'], 'id', 'type');
            load_values_in_dropdowns('ddl_transaction_shareholder', 'Select', init_data['data']['shareholders_info'], 'id', 'name');
        }
    });

    $('#ddl_transaction_type').change(function(){
        var t_type = $('#ddl_transaction_type').val();
        $('#ddl_transaction_paymentType').val(0);
        $('#ddl_transaction_name').val(0);
        $('#ddl_transaction_shareholder').val(0);
        $('#ddl_transaction_employee').val(0);
        $('#txt_transaction_desc').val('');
        $('#txt_transaction_amount').val('');
        $('#spn_balance_to_pay').text('') ;       

        if (parseInt(t_type) == 2 || parseInt(t_type) == 4){
            $('.debit_rel').show();
        }else{
            $('.debit_rel').hide();
        }

        if (parseInt(t_type) != 2){
            $('.dis_sHolder').show();
        }else{
            $('.dis_sHolder').hide();
        }

        if (parseInt(t_type) == 2){
            load_values_in_dropdowns('ddl_transaction_shareholder', 'Select', [], '', '');
        }else{
            var url_for_init = global_url+'transactions/load_initial_data';       
            var init_data = call_ajax('get', url_for_init, {}, {});
            if (init_data['result'] == 'success'){
                load_values_in_dropdowns('ddl_transaction_shareholder', 'Select', init_data['data']['shareholders_info'], 'id', 'name');
            }else{
                load_values_in_dropdowns('ddl_transaction_shareholder', 'Select', [], '', '');
            }                        
        }        
    });

    $('#ddl_payee_type').change(function(){
        var t_type = $('#ddl_payee_type').val();
        var acc_type = $('#ddl_transaction_name').val();
        $('#spn_balance_to_pay').text(''); 
         
        if (parseInt(t_type) > 0 && parseInt(acc_type) > 0){
            if ($('#ddl_payee_type option:selected').text() != 'Other'){
                $('.paying_to').show();  
                $('.balance_to_pay').show();                         
                load_employee_names('ddl_transaction_employee', t_type, acc_type);
            }else{
                $('.paying_to').hide();
                $('.balance_to_pay').hide();
            }            
        }else{
            alert('Please select account type and payee type');
            load_employee_type('ddl_payee_type');
            // load_values_in_dropdowns('ddl_transaction_employee', 'Select', [], '', '');
        }
    });


    $('#ddl_transaction_employee').change(function(){
        $('#spn_balance_to_pay').val('');
        var trans_name = $('#ddl_payee_type').val();
        var acc_type = $('#ddl_transaction_name').val();
        var trans_paying_to = $('#ddl_transaction_employee').val();

        if (trans_paying_to != 0){
            var url = global_url+'transactions/get_balance_amount/'+acc_type+','+trans_name+','+trans_paying_to;
            // alert(url);
            // console.log(url);
            var val_result = call_ajax('get', url, {}, {});
            if(val_result.result == 'success'){
                $('.balance_to_pay').show();
                var result_data = val_result.data;
                $('#spn_balance_to_pay').text(result_data);
            }else if (val_result.result == 'failed' && val_result.data == 'NoneType'){
                $('.balance_to_pay').hide();
            }else{
                alert(val_result.data);
            }
        }else{
            $('#spn_balance_to_pay').text('');
        }
    });


    function get_transactions_between_dates(from_date, to_date){
        var form_url = global_url+'transactions/get_transactions/';
        if (from_date != '' && to_date != ''){
            form_url += from_date+','+to_date;
        }

        var get_result = call_ajax('get',form_url,{},{});        
        if(get_result.result == 'success' && Object.keys(get_result.data).length > 0){   
            var result_data = get_result.data;
            form_table(result_data['act'], 'tblBalanceSheet', 'divBalanceSheet', result_data['total']);
        }else{
            form_table([], 'tblBalanceSheet', 'divBalanceSheet');
        }
    }
});
