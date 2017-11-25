// Whole-script strict mode syntax
// "use strict";
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

function isNumeric(num){
    return !isNaN(num)
}
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function removeParameterFromURL(url) {
    if (url.indexOf("?") != -1) {
	url = url.slice(0, url.indexOf("?"));
    }
    return url;
}

const EEParser = require('expr-eval').Parser;
const math = require('mathjs');

const subst = (expr, varname, value) => {
    expr.traverse(function (node, path, parent) {
	switch (node.type) {
	case 'SymbolNode': {
	    if (node.name == varname) {
		node.name = value;
	    }
	} break;
	}
    });
    return expr;
}

function lex2str(lex) {
    let Buffer = '';
    let Result = '';
    for (var i = 0; i < lex.length; ++i) {
	if (lex[i] == ' ') continue;
	Buffer += lex[i];
	if (isNumeric(Buffer) && isNumeric(lex[i+1]))
	    continue;
	if (Buffer[0] == '\\' && lex[i+1] != '{')
	{
	    // 引数がないlatex特殊文字
	    switch (Buffer) {
	    case '\\cdot':
		Result += '*';
		Buffer = '';
		break;
	    default: continue;
	    }
	}

	if (Buffer[0] == '\\') {
	    Buffer = '';
	    continue;
	}

	if (Result != '' && !Result.slice(-1).match(/[+-/*^\( ]/) && Buffer == '(')
	    Result += '*';
	else if (Result != '' && !Result.slice(-1).match(/[+-/*^\)\(]/) && !Buffer.match(/[+-/*^\)\(]/)) 
	    Result += '*';
	Result += Buffer;

	
	Buffer = '';
    }
    // 乗算の処理
    console.log(Result);
    return Result;
}

function show_result(p) {
    // Showing math expression
    $("#visual-expr").html("$$"+p+"$$");
    MathJax.Hub.Typeset($("#visual-expr")[0], null);

    $("#visual-base-expr").html("$$"+getParameterByName('p')+"$$");
    MathJax.Hub.Typeset($("#visual-base-expr")[0], null);

    const expr = EEParser.parse(lex2str(p));
    show_variables(EEParser.parse(lex2str(getParameterByName('p'))));

    $("#result").css("display", "block");

    // Draw graph.
    if (expr.variables().length > 1) return;

    const gaf = new Gaf($("gaf"));
    gaf.draw_rectangle(0, 150, 300, 1);
    gaf.draw_rectangle(150, 0, 1, 300);

    // Draw graph
    let px, py;
    for (let i = -150; i < 150; i++) {
	const x = i+150;
	const y = 150 - expr.evaluate({ x: x-150 });
	if (0 <= x <= 300 && 0 <= y && y <= 300)
	    gaf.draw_point(x, y, "blue");
    }

    // Put red point according to the movement of the mouse.
    let old = null;
    let old2 = null;
    $("#graph").unbind('mousemove');
    $("#graph").mousemove(function(e) {
	let x = e.clientX-$("#graph").position().left;
	let y = e.clientY-$("#graph").position().top;
	let elmx = x;
	let elmy = 150 - expr.evaluate({ x: x-150 });
	if (old) {
	    old.remove();
	    old = null;
	}
	if (old2) {
	    old2.remove();
	    old2 = null;
	}
	if (0 < elmy && elmy < 300)
	    old = gaf.draw_letter(elmx, elmy, "("+(elmx-150)+","+(150-elmy)+")");
	else
	    old = gaf.draw_letter(elmx, 0, "("+(elmx-150)+","+(150-elmy)+")");
	if (0 < elmy && elmy < 300)
	    old2 = gaf.draw_ellipse(elmx, elmy, 5, 5, "red");
    });
}

function show_variables(expr) {
    $("#variables").html("");
    expr.variables().forEach(function(val, idx, array) {
	$("#variables").append(`
<div class="input-group">
  <span class="input-group-addon">
    <input type="radio" aria-label="Radio button for following text input">
  </span>
  <span class="input-group-addon" id="var_${val}">${val}</span>
  <input type="text" class="form-control" aria-describedby="var_${val}" id="input_${val}">
  <span class="input-group-btn">
    <button class="btn btn-secondary substitute" id="subst_${val}" type="button">Substitute ></button>
  </span>
</div>
`);
    });
}

function run(lex) {
    // var thisurl = removeParameterFromURL(window.location.href);
    // location.href = thisurl + "?p="+encodeURIComponent(lex);
    show_result(lex);
}

$(function() {
    $(document).on('keydown', function(e) {
	// スラッシュ(/)が押された場合検索窓を選択して入力状態に
	if (e.keyCode == 191 && !$("input:focus").length) {
	    $("#user").select();
	    return false;
	}
	if (e.keyCode == 13 && $(":focus").attr("id") == "user") {
	    $("#go").click();
	    return false;
	}
    });

    $(document).on('click', "#go", function() {
	const thisurl = removeParameterFromURL(window.location.href);
	location.href = thisurl + "?p="+encodeURIComponent($("#user").val());
//	run($("#user").val());
//	show_result();
    });


    $(document).on("click", ".substitute", function(e) {
	const base_expr_string = lex2str(getParameterByName('p'));
	let expr = math.parse(base_expr_string);
	let var_operation = '';
	$("#variables div input").each(function (index, element) {
	    const varname = element.id.replace("input_", "");
	    if (varname != '' && element.value != '')
		expr = subst(expr, varname, element.value);
//		expr = expr.replace(new RegExp(varname, "g"), element.value);
//		var_operation += varname + " = " + element.value + ";";
	});
	//	let result = math.parse(var_operation + base_expr_string).toString();
	let result = lex2str(expr.toTex());
	run(result);
    });

    if (getParameterByName('p')) {
	show_result(getParameterByName('p'));
    }
});
