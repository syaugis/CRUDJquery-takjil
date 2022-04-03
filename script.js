let db = openDatabase('db.takjil', '2.0', 'Takjil DataBase', 2 * 1024 * 1024);
        
    function loadData(){
        $("#tablejil").children().remove();
        db.transaction(function(transaction){
            var sql = "SELECT * FROM takjil ORDER BY id ASC";
            transaction.executeSql(sql, undefined, 
            function(transaction, result){
                if (result.rows.length) {
                    for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows.item(i);
                            var id = row.id;
                            var personName = row.personName;
                            var address = row.address;
                            var RT = row.RT;
                            var total = row.total;
                            var btnEdit = '<button class="btn btn-warning btn-edit"   onclick="edit(' + id + ')">Edit</button>';
                            var btnDelete = '<button class="btn btn-danger btn-edit"  onclick="wipe(' + id + ')">Delete</button>';
                                $("#tablejil").append('<tr><td>' + 
                                id + '</td><td>' +
                                personName + '</td><td>' + 
                                address + '</td><td>' +
                                RT + '</td><td align = "center">' +
                                total + '</td>' +
                                '</td><td align = "center">' +
                                btnEdit + ' ' + btnDelete + '</td></tr>');                  
                    }
                }else {
                    $("#tablejil").append('<tr><td colspan="6" align="center">No Data Found</tr></td>');
                }
            }//, function(transaction, err){
            //     alert(err.message);}
            );
        });
        showList();
    }

    function showList() {
        db.transaction(function(transaction){
        var sql = "SELECT * FROM takjil";
        transaction.executeSql(sql, [], 
        function(transaction, results){
            let len = results.rows.length, i;
            let temp = new Array;
            $("#listRT").html("");
            for (i = 0; i < len; i++) {
                temp[i] = results.rows.item(i).RT;
            } 
            let uniqueTemp = [...new Set(temp)];
            uniqueTemp.sort((a,b) => {
                if(a > b) return 1;
                if(a < b) return -1;
                return 0;
            });
            $("#listRT").append('<option value="0" onchange="filterRT()">Show All</option>')
            for (i = 0; i < uniqueTemp.length; i++) {
                $("#listRT").append("<option value=" + uniqueTemp[i] + ">" + uniqueTemp[i] + "</option>");   
                } 
            }, null);
        });
    } 

    function filterRT() {
        let rtValue = $("#listRT").val();
        $("#tablejil").children().remove();
        db.transaction(function(transaction){
            var sql = "SELECT * FROM takjil WHERE RT=" + rtValue;
            transaction.executeSql(sql, [], 
                function(transaction,result){
                    if (rtValue == 0) return loadData();
                    if (result.rows.length) {
                    for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows.item(i);
                            var id = row.id;
                            var personName = row.personName;
                            var address = row.address;
                            var RT = row.RT;
                            var total = row.total;
                            var btnEdit = '<button class="btn-edit btn btn-warning"   id="btn-edit" onclick="edit(' + id + ')">Edit</button>';
                            var btnDelete = '<button class="btn btn-danger"  onclick="wipe(' + id + ')">Delete</button>';
                                $("#tablejil").append('<tr><td>' + 
                                id + '</td><td>' +
                                personName + '</td><td>' + 
                                address + '</td><td>' +
                                RT + '</td><td align = "center">' +
                                total + '</td>' +
                                '</td><td align = "center">' +
                                btnEdit + ' ' + btnDelete + '</td></tr>');                  
                    }
                }else {
                    $("#tablejil").append('<tr><td colspan="6" align="center">No Data Found</tr></td>');}
            });
        });  
    }

    function edit(id){
        swal({
            title: "Are you sure want to edit ?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
            })
            .then((willEdit) => {
                if(!willEdit) {
                    return;
                }else{
                    db.transaction(function(transaction){
                    var sql = "SELECT * FROM takjil WHERE id=" + id;
                    transaction.executeSql(sql, [], 
                        function(transaction, results){
                            $("#personName").val(results.rows.item(0).personName);
                            $("#address").val(results.rows.item(0).address);
                            $("#RT").val(results.rows.item(0).RT);
                            $("#total").val(results.rows.item(0).total);
                        });
                    });
                        $("#insert").hide(); $("#update").show(); $("#cancel").show();
                        window.idValue = id; 
                }       
            });
    }
    
    function renew() {
        var id = window.idValue;
        var personName = $("#personName").val();
        var address = $("#address").val();
        var RT = $("#RT").val();
        var total = $("#total").val();

        if (personName == ""|| address == "" || RT == ""|| total == ""){
                return alert("FIELD CANNOT BE EMPTY");
            }
                if ( RT == "0"|| total == "0") {
                    return alert("Value must be greater than or equal to 1");
                }
        
        if (RT == "") RT = "NULL"; if (total == "") total = "NULL";

        db.transaction(function(transaction){
            var sql = "UPDATE takjil SET personName='" + personName 
                + "',address ='" + address 
                + "',RT =" + RT 
                + ",total =" + total 
                + " WHERE id =" + id + "";
                transaction.executeSql(sql, undefined);
        });   
        $("#update").hide(); $("#cancel").hide(); $("#insert").show();
        $("#personName").val(""); $("#address").val(""); $("#RT").val(""); $("#total").val("");
        loadData();
    }

    function wipe(id){
        swal({
            title: "Are you sure want to delete?",
            text: "Once deleted, you will not be able to recover this selected data!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (!willDelete) {
                return;
            }else {
                db.transaction(function(transaction){
                    var sql = "DELETE FROM takjil WHERE id =" + id;
                    transaction.executeSql(sql, undefined);
                });
                loadData();
                swal("Poof! Your selected data has been deleted!", {
                    icon: "success",
                });
            }
        });
    }

    function exportPdf() {
        html2canvas(document.getElementById('tableData'), {
            onrendered: function (canvas) {
                var data = canvas.toDataURL();
                var docDefinition = {
                    content: [{
                        image: data,
                        width: 500
                    }]
                };
                pdfMake.createPdf(docDefinition).download("Table.pdf");
            }
        });
    }

    function exportExcel(tableID, filename = ''){
        var downloadLink;
        var dataType = 'application/vnd.ms-excel';
        var tableSelect = document.getElementById(tableID);
        var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
        
        // Specify file name
        filename = filename?filename+'.xls':'excel_data.xls';
        
        // Create download link element
        downloadLink = document.createElement("a");
        
        document.body.appendChild(downloadLink);
        
        if(navigator.msSaveOrOpenBlob){
            var blob = new Blob(['\ufeff', tableHTML], {
                type: dataType
            });
            navigator.msSaveOrOpenBlob( blob, filename);
        }else{
            // Create a link to the file
            downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        
            // Setting the file name
            downloadLink.download = filename;
            
            //triggering the function
            downloadLink.click();
        }
    }

    function searchTable() {
        // Declare variables
        var input, filter, table, tr, td, i, txtValue;
        input = document.getElementById("myInput");
        filter = input.value.toUpperCase();
        table = document.getElementById("tableData");
        tr = table.getElementsByTagName("tr");

        // Loop through all table rows, and hide those who don't match the search query
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[1];
            if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
            }
        }
    }
    
    $(function(){
        loadData();
        showList();
        $("#create").click(function(){
            swal({
                title: "Do you want to create table?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willCreate) => {
                if (willCreate) {
                    db.transaction(function(transaction){
                        let sql = "CREATE TABLE takjil" + 
                        "(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
                        "personName VARCHAR(100) NULL," +
                        "address VARCHAR(100) NULL," + 
                        "RT INTEGER NULL,"+
                        "total INTEGER NULL)";
                        transaction.executeSql(sql, undefined,
                        function(){
                            swal("Success", {
                                icon: "success",
                            });
                            loadData();
                        } 
                        ,function(transaction, err){
                            swal(err.message, {
                            icon: "error",
                                })
                            }
                        );
                    });
                }else {
                    return; 
                }
            });
        });

        $("#delete").click(function(){
            swal({
                title: "Do you want to delete this table?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDeleteTable) => {
                if (willDeleteTable) {
                    db.transaction(function(transaction){
                        let sql = "DROP TABLE takjil";
                        transaction.executeSql(sql, undefined,
                        function(){
                            swal("Success", {
                                icon: "success",
                            });
                        } 
                        ,function(transaction, err){
                            swal(err.message, {
                            icon: "error",
                            });
                        });
                    });
                    loadData();
                }else {
                    return;
                }
            });
        });

        $("#insert").click(function(){
            let personName = $("#personName").val();
            let address = $("#address").val();
            let RT = $("#RT").val();
            let total = $("#total").val();
            if (personName == ""|| address == "" || RT == ""|| total == ""){
                return alert("FIELD CANNOT BE EMPTY");
            }
                if ( RT == "0"|| total == "0") {
                    return alert("Value must be greater than or equal to 1");
                }
            
            db.transaction(function(transaction){
                let sql = "INSERT INTO takjil(personName, address, RT, total) VALUES(?, ?, ?, ?)";
                transaction.executeSql(sql, [personName, address, RT, total], 
                function(){
                    swal("Success", {
                            icon: "success",
                    });
                }, function(transaction, err){
                    swal(err.message, {
                    icon: "error",
                    });
                });
            });
            $("#personName").val(""); $("#address").val(""); $("#RT").val(""); $("#total").val("");
            loadData();
        })

        $("#cancel").click(function(){
            $("#update").hide(); $("#insert").show(); $("#cancel").hide();
            $("#personName").val(""); $("#address").val(""); $("#RT").val(""); $("#total").val("");
        })
})