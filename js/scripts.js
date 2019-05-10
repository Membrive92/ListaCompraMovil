var db;//variable para almacenar la bd
var nombre_actualizar;
var filtro;

window.addEventListener("load",init);//cuando se carga el documento entonces se ejecta la función init

function init() {
    $("#exampleModaladd").on('shown.bs.modal',function () {
            $("#nombre").trigger('focus');
    });
    $("#exampleModalupdate").on('shown.bs.modal',function () {
        $("#update").trigger('focus');
    });

        open(); //abrir y crear si no existiese la BD.
    crearTabla(); // Se crea si fuese necesario la tabla de las tareas.
    mostrarNombres();// Se muestran las tareas ya existentes si las hubiese.
    $("#filtro").on("keyup",function () {
        Filtro();
    });






}

function Filtro() {
    filtro = $("#filtro").val().toLowerCase();
    $("#todoItems p").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(filtro) > -1)
    })
}

/*Función que abre o crea si no existe la BD Lista*/
function open() {
    var dbSize = 5 * 1024 * 1024; //tamaño de la bd 5MB
    db = openDatabase("Lista", "1.0", "Lista de mis cosicas", dbSize);//Argumentos: nombredelaBD, versión, Descripción, Tamaño
}

/*Función que crea si no existe la tabla taras*/
function crearTabla() {
    db.transaction(function(tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS listacompra(ID INTEGER PRIMARY KEY ASC, nombre TEXT, marcado INTEGER)", []);
    });

}

/*función que se ejecuta cuando le damos al botón, recoge la tarea del form y llama a addTarea2 para añadir una tarea*/
function addNombre1() {
    if ($("input").val() === ""){
        alert("EL campo no puede estar vacio");
    }  else {

        var nombre = document.getElementById("nombre");
        addNombre2(nombre.value);
        resetear();
        focalizar();
    }
}

/*Función que resetea el formulario*/
function resetear()  {
    document.getElementById("nombre").value="";
}

/*Función auxiliar de addTarea1 que permite añadir una tarea a la tabla*/
function addNombre2(nombre) {
    db.transaction(function(tx){
        //Si la transacción se ejecuta con éxito entonces se ejecuta onSuccess, si no, onError
        tx.executeSql("INSERT INTO listacompra(nombre, marcado) VALUES (?,?)",[nombre, 0],onSuccess,onError);
    });
}

/*Función muestra error*/
function onError(tx, e) {
    alert("Errorcete: " + e.message);
}

/*Función éxito, muestra de nuevo las tareas*/
function onSuccess(tx, r) {
    mostrarNombres();
}

/*Funión para mostrar todas las tareas, accede a la tabla y recoge toda la información,
entonces llama a mostrarTareasfor*/
function mostrarNombres() {
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM listacompra", [], mostrarNombresfor,onError);
    });
}
/*Función auxiliar de motarTareas, que imprime todas las tareas de la tabla*/
function mostrarNombresfor(tx, resul) {
    var rowOutput = "";
    var todoItems = document.getElementById("todoItems");
    for (var i=0; i < resul.rows.length; i++) {

        rowOutput += renderTodo(resul.rows.item(i));

    }
    todoItems.innerHTML = rowOutput;
    Filtro();
    $(".eventomovil").on('swipeleft',function(e,data){
        borrarNombre($(this).attr("id"));
    });
    $(".eventomovil").on('swiperight',function(e,data){
        ActualizarNombre2($(this).attr("id"));
        $('#exampleModalupdate').modal('toggle');
    });


}
/*Función para borrar una tarea a través de su id*/
function borrarNombre(id) {
    db.transaction(function(tx){
        tx.executeSql("DELETE FROM listacompra WHERE ID=?", [id],
            onSuccess,
            onError);
    });
}

function ActualizarNombre() {

    var valor_nombre=  document.getElementById("update").value;
    db.transaction(function(tx){
        tx.executeSql("UPDATE listacompra SET nombre = ? WHERE ID = ?",[valor_nombre,nombre_actualizar],onSuccess,onError);

    });
}

function ActualizarNombre2(id) {
    nombre_actualizar = id;
    var valor_nombre= document.getElementById(id).innerHTML;
    document.getElementById("update").value = valor_nombre;

}


function renderTodo(row) {
     if(row.marcado ===0){
     return "<p id='"+row.ID +"' class='eventomovil' onclick='ActualizarMarcado("+ row.ID +")' >" + row.nombre  + "</p>";

    } else {
     return "<p id='"+row.ID +"' class='tachar eventomovil' onclick='ActualizarMarcado("+ row.ID +")' >" + row.nombre  + "</p>"
     }

}

function ActualizarMarcado(id) {
    db.transaction(function(tx){
        tx.executeSql("SELECT * FROM listacompra  WHERE ID = ?",[id],CambiarMarcado);

    });
}
function SeleccionarTodosMarcado() {
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM listacompra", [], MarcarTodos);
    });
}
function SeleccionarTodosDesmarcado() {
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM listacompra", [], DesmarcarTodos);
    });
}



function MarcarTodos(tx) {
    tx.executeSql("UPDATE listacompra SET marcado=?", [1], onSuccess());

}

function DesmarcarTodos(tx) {
    tx.executeSql("UPDATE listacompra SET marcado=?", [0], onSuccess());

}
function VaciarLista() {
    db.transaction(function (tx) {
        tx.executeSql("DELETE FROM listacompra", [],onSuccess);
    });

}




function CambiarMarcado(tx,apuntar_marcado) {
    var Id = apuntar_marcado.rows.item(0).ID;
    var cambiar = apuntar_marcado.rows.item(0).marcado;

    if(cambiar ===0){
        db.transaction(function(tx){
        tx.executeSql("UPDATE listacompra SET marcado = ? WHERE ID = ?",[1,Id],onSuccess);
        });
    } else {
        db.transaction(function(tx) {
            tx.executeSql("UPDATE listacompra SET marcado = ? WHERE ID = ?", [0, Id], onSuccess);
        });
    }

}

$(function() {

    $(function () {
        var ancho = $(window).width();

        if (ancho <= 1350) {
            $('body').css({
                'background-size': 'initial'
            });
        }
        $(window).scroll(function () {
            var barra = $(window).scrollTop();
            var posicion = (barra * 0.10);

            $('body').css({
                'background-position': '0 -' + posicion + 'px'
            });

        });

    });
});

function focalizar() {
    $("#nombre").focus();


}


var input = document.getElementById("nombre");
var input_actualizar = document.getElementById("update");
input.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("add").click();

    }
});
input_actualizar.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("updadate").click();

    }
});











