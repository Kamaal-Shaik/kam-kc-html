// var global_url = 'http://localhost:5000/kc/';
// var global_url = 'http://localhost:5252/kc/';
var global_url = 'https://kam-flask.herokuapp.com/kc/';

function load_values_in_dropdowns(ddl_id, default_test, data_lst, key_text, value_text){
    jQuery("#"+ddl_id).html('');
    jQuery("#"+ddl_id).append(jQuery("<option></option>").val("0").html(default_test));
    if (data_lst.length > 0){        
        for (var i = 0; i < data_lst.length; i++) {
            jQuery("#"+ddl_id).append(jQuery("<option></option>").val(data_lst[i][key_text]).html(data_lst[i][value_text]));
        }
    }
}


function load_transaction_type(ddl_id){
    var url_for_init = global_url+'transactions/load_initial_data';       
    var init_data = call_ajax('get', url_for_init, {}, {});
    if (init_data['result'] == 'success'){
        var res = init_data['data']['transaction_type'];
        load_values_in_dropdowns(ddl_id, 'Select', res, 'id', 'type');
    }
}

function load_account_type(ddl_id){
    var url_for_tType = global_url+'transactions/get_account_types/';
    var init_data = call_ajax('get', url_for_tType, {}, {});
    if (init_data['result'] == 'success'){
        load_values_in_dropdowns(ddl_id, 'Select', init_data['data'], 'id', 'type');
    }else{
        load_values_in_dropdowns(ddl_id, 'Select', [], '', '');
    }   
}

function load_employee_type(ddl_id){
    var url_for_tType = global_url+'transactions/get_transaction_names/';
    var init_data = call_ajax('get', url_for_tType, {}, {});
    if (init_data['result'] == 'success'){
        load_values_in_dropdowns(ddl_id, 'Select', init_data['data'], 'id', 'emp_type');
    }else{
        load_values_in_dropdowns(ddl_id, 'Select', [], '', '');
    }
}

function load_employee_names(ddl_id, emp_type, acc_type){
    var url_for_tType = global_url+'transactions/get_employee_names/'+parseInt(emp_type)+','+parseInt(acc_type);
    var init_data = call_ajax('get', url_for_tType, {}, {});
    // alert(JSON.stringify(init_data));
    if (init_data['result'] == 'success'){
        load_values_in_dropdowns(ddl_id, 'Select', init_data['data'], 'id', 'emp_name');
    }else{
        load_values_in_dropdowns(ddl_id, 'Select', [], '', '');
    }
}


function not_available_func(cols_length){
    return '<tbody><tr><td colspan="'+ cols_length +'" style="text-align:left;"><h4>Data Not Available<h4></td></tr></tbody>';
}


function call_ajax(method="",url="",params={},headers={}){
    // alert(JSON.stringify(params));
    var res = [];
    var parameters = {
        type: method,
        url: url,
        // dataType: 'jsonp',
        async: false,
        data: JSON.stringify(params),
        headers: headers,
        success: function(data, textStatus, jqXHR){
            // alert(JSON.stringify(data));
            return res.push({result:data['status'], data : data['info'] });
        },
        error: function(jqXHR, exception){
            // alert(JSON.stringify(jqXHR));
            res.push({ result:'failed', data: jqXHR });
        }
    }
    if (method.toLowerCase() == 'post'){
        parameters.dataType = 'json';
        parameters.contentType = 'application/json; charset=utf-8';
    }
    // alert(JSON.stringify(parameters));
    jQuery.ajax(parameters);
    return res[0]
}

function form_table(data, tbl_id, tbl_div, footer_amt){
    var result_div = document.getElementById(tbl_div);
    result_div.innerHTML = ''
    var html_data = '<table id="'+ tbl_id +'" style="border:1px solid #e5e5e5;border-radius:4px;border-bottom:1px solid #111;border-collapse:collapse;" width="100%"><thead><tr>';
    html_data += '<td><strong>S.No.</strong></td><td><strong>Date</strong></td><td><strong>Transaction</strong></td><td><strong>Account</strong></td><td><strong>Transaction Name</strong></td><td><strong>Paid To</strong></td><td><strong>Amount</strong></td><td><strong>Paid Through</strong></td><td><strong>Paid By</strong></td><td><strong>Description</strong></td>';
    html_data += '</tr></thead><tbody>';

    if (data.length > 0){
        for(var i=0;i<data.length;i++){
            html_data += '<tr id="'+ data[i].id +'">';
            html_data += '<td>'+(i+1)+'</td><td>'+data[i].date+'</td><td>'+data[i].transaction+'</td><td>'+data[i].acc_type_text+'</td><td>'+data[i].transaction_name_text+'</td><td>'+ data[i].employee_name +'</td><td>'+data[i].amount+'</td><td>'+data[i].payment_type+'</td><td>'+data[i].paid_person_name+'</td><td>'+data[i].description+'</td>';
            html_data += '</tr>';
        }
    }else{
        html_data += '<tr><td colspan="10">No Data Available</td></tr>';
    }
    html_data += '</tbody>';

    if(data.length > 0){
        html_data += '<tfoot><tr>';
        html_data += '<td colspan="10" style="text-align:right;"><strong>Grant Total : '+footer_amt+'</strong></td>';
        html_data += '</tr></tfoot>';
    }
    html_data += '</table>';

    result_div.innerHTML = html_data;

    jQuery.noConflict();
    jQuery('#'+tbl_id).dataTable({
        "aLengthMenu": [[5, 10, 25, 50, 75, -1], [5, 10, 25, 50, 75, "All"]],
        // "iDisplayLength": -1,
        "iDisplayLength": 5,
        "scrollX": true
    }).addClass("table-striped");;
}
