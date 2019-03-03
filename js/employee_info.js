function load_emp_types(){
    var url_for_init = global_url+'transactions/load_initial_data';       
    var init_data = call_ajax('get', url_for_init, {}, {});
    if (init_data['result'] == 'success'){
        load_values_in_dropdowns('ddl_select_trans_type', 'Select', init_data['data']['transaction_type'], 'id', 'type');
        $("#ddl_select_trans_type option[value='4']").remove();
        load_values_in_dropdowns('ddl_select_emp_type', 'Select', init_data['data']['employee_types_info'], 'id', 'emp_type');         
        load_values_in_dropdowns('ddl_select_acc_type', 'Select', init_data['data']['account_types_info'], 'id', 'type');
    }    
}


jQuery(document).ready(function($){

    $( "#emp_info_datepicker_from" ).datepicker({
        dateFormat: 'dd-mm-yy'
    });
    
    $( "#emp_info_datepicker_to" ).datepicker({
        dateFormat: 'dd-mm-yy'
    });
    $('.ddl_emp_name').hide();
    load_emp_types();

    $('#ddl_select_emp_type').change(function(){
        var t_type = $('#ddl_select_emp_type').val();
        var acc_type = $('#ddl_select_acc_type').val();
         
        if (parseInt(t_type) > 0 && parseInt(acc_type) > 0){
            if ($('#ddl_select_emp_type option:selected').text() != 'Other'){
                $('.ddl_emp_name').show();                         
                load_employee_names('ddl_select_emp_name', t_type, acc_type);
            }else{
                $('.ddl_emp_name').hide();
            }            
        }else{
            alert('Please select account type and payee type');
            load_employee_type('ddl_select_emp_type');
            // load_values_in_dropdowns('ddl_transaction_employee', 'Select', [], '', '');
        }

    });    

    $('#btn_load_employee_info').click(function(){
        var transaction_type = $('#ddl_select_trans_type').val();
        var account_type = $('#ddl_select_acc_type').val();
        var transaction_name = $('#ddl_select_emp_type').val();
        var employee = $('#ddl_select_emp_name').val();
        var from_date = $( "#emp_info_datepicker_from" ).val();
        var to_date = $( "#emp_info_datepicker_to" ).val();
    
        if ((from_date != '' && to_date == '') || (from_date == '' && to_date != '') || (to_date < from_date)){
            alert('If you want select date must select from and to dates. Or \'To\' date should be greaterthan or equal to \'From\' date');
        }else{
            var data_dict = {}
            var lst = ['transaction_type', 'account_type', 'transaction_name', 'employee']
            var val = [transaction_type, account_type, transaction_name, employee]
            for(i=0;i<lst.length;i++){
                if (val[i] > 0){
                    data_dict[lst[i]] = parseInt(val[i]);
                }
            }        
            if (from_date != '' && to_date != ''){
                data_dict['from_date'] = from_date;
                data_dict['to_date'] = to_date;
            }

            var url = global_url+'emp_transactions/get_transactions/';
            var get_res = call_ajax('POST', url, data_dict, {'Content-Type':'application/json'});
            if (get_res['result'] == 'success' && Object.keys(get_res['data']).length > 0){
                form_table(get_res['data']['act'], 'tbl_emploee_balance_sheet', 'div_emploee_balance_sheet', get_res['data']['total']);
            }else{
                form_table([], 'tbl_emploee_balance_sheet', 'div_emploee_balance_sheet');
            }
        }        
    });

    $('#add_new_acc_type_dialog').dialog({
        open:function(event, ui){
            $('#txt_add_new_acc_type').val('');
            $('#txt_add_new_acc_type_desc').val('') ;
        },        
        title: 'Add New Account Type',
        draggable: true,
        resizable: false,
        closeOnEscape: true,
        modal: true,
        autoOpen: false,
        buttons:[{
                id: 'btn_modal_add_new_acc_type',
                text: 'Add New Account Type',
                click: add_new_acc_type_dialog_save
            },
            {
                id:"btn_modal_add_new_acc_type_cancel",
                text: "Cancel",
                click: function() {
                    $(this).dialog("close");
                }
            }]
    });    

    $('#add_new_emp_type_dialog').dialog({
        open:function(event, ui){
            load_values_in_dropdowns('ddl_add_new_emp_type_trans_type', 'Select', [], '', '');
            $('#txt_add_new_emp_type_emp_type').val('');
            $('#txt_add_new_emp_type_desc').val('') ;
        },        
        title: 'Add New Employee Type',
        draggable: true,
        resizable: false,
        closeOnEscape: true,
        modal: true,
        autoOpen: false,
        buttons:[{
                id: 'btn_modal_add_new_emp_type',
                text: 'Add New Employee Type',
                click: add_new_emp_type_dialog_save
            },
            {
                id:"btn_modal_add_new_emp_type_cancel",
                text: "Cancel",
                click: function() {
                    $(this).dialog("close");
                }
            }]
    });

    $('#add_new_emp_dialog').dialog({
        open:function(event, ui){
            load_values_in_dropdowns('ddl_add_new_emp_emp_type', 'Select', [], '', '');
            $('#txt_add_new_emp_emp_name').val('');
            $('#txt_add_new_emp_amount_to_pay').val('');
            $('#txt_add_new_emp_desc').val('') ;
        },        
        title: 'Add New Employee',
        draggable: true,
        resizable: false,
        closeOnEscape: true,
        modal: true,
        autoOpen: false,
        buttons:[{
                id: 'btn_modal_add_new_emp',
                text: 'Add New Employee',
                click: add_new_emp_dialog_save
            },
            {
                id:"btn_modal_add_new_emp_cancel",
                text: "Cancel",
                click: function() {
                    $(this).dialog("close");
                }
            }]
    });

    $('#btn_add_new_acc_type').click(function(){
        $('#add_new_acc_type_dialog').dialog('open');
    });    

    $('#btn_add_new_emp_type').click(function(){
        $('#add_new_emp_type_dialog').dialog('open');
    });

    $('#btn_add_new_emp').click(function(){
        $('#add_new_emp_dialog').dialog('open');
        load_employee_type('ddl_add_new_emp_emp_type');
        load_account_type('ddl_add_new_emp_acc_type');
    });


    function add_new_acc_type_dialog_save(){
        var new_acc_type = $('#txt_add_new_acc_type').val();
        var description = $('#txt_add_new_acc_type_desc').val();
        if ($.trim(new_acc_type) != ''){
            var url_insert = global_url+'emp_transactions/add_new_acc_type';
            var data = { 'type':$.trim(new_acc_type), 'description':description };
            var inserted_result = call_ajax('POST', url_insert, data, {'Content-Type':'application/json'});
            if (inserted_result['result'] == 'success'){
                alert('Successfully inserted the record.');
                load_account_type('ddl_select_acc_type');             
            }else{
                alert(JSON.stringify(inserted_result['data']));
            }            
            $('#add_new_acc_type_dialog').dialog('close');
        }else{
            alert('Please fill mandatory fields.')
        }
    }

    function add_new_emp_type_dialog_save(){
        var new_emp_type = $('#txt_add_new_emp_type_emp_type').val();
        var description = $('#txt_add_new_emp_type_desc').val();
        if ($.trim(new_emp_type) != ''){
            var url_insert = global_url+'emp_transactions/add_new_emp_type';
            var data = { 'emp_type':$.trim(new_emp_type), 'description':description };
            var inserted_result = call_ajax('POST', url_insert, data, {'Content-Type':'application/json'});
            if (inserted_result['result'] == 'success'){
                alert('Successfully inserted the record.');
                load_employee_type('ddl_select_emp_type');            
            }else{
                alert(JSON.stringify(inserted_result['data']));
            }            
            $('#add_new_emp_type_dialog').dialog('close');
        }else{
            alert('Please fill mandatory fields.')
        }
    }

    function add_new_emp_dialog_save(){
        var new_acc_type = $('#ddl_add_new_emp_acc_type').val();
        var new_emp_type = $('#ddl_add_new_emp_emp_type').val();
        var new_emp = $('#txt_add_new_emp_emp_name').val();
        var amount_to_pay = $('#txt_add_new_emp_amount_to_pay').val();        
        var description = $('#txt_add_new_emp_desc').val();
        var amt_pay = "null"
        if (amount_to_pay != ''){
            amt_pay = parseFloat(amount_to_pay)
        }
        if (parseInt(new_emp_type) > 0 && $.trim(new_emp) != '' && parseInt(new_acc_type) > 0){
            var url_insert = global_url+'emp_transactions/add_new_employee';
            var data = { 'emp_name': $.trim(new_emp), 'emp_type': parseInt($.trim(new_emp_type)),
                'description': $.trim(description), 'amount_to_be_paid': amt_pay,
                'account_type': parseInt(new_acc_type)
            };           
            var inserted_result = call_ajax('POST', url_insert, data, {'Content-Type':'application/json'});
            if (inserted_result['result'] == 'success'){
                alert('Successfully inserted the record.');
                load_employee_names('ddl_select_emp_name', new_emp_type, new_acc_type);
            }else{
                alert(JSON.stringify(inserted_result['data']));
            }
            $('#add_new_emp_dialog').dialog('close');
        }else{
            alert('Please fill mandatory fields.')
        }        
    }
});


