const apiUrl = 'https://rithm-jeopardy.herokuapp.com/api/';
const categoryNum = 6;
const clueNum = 5;

const startGame = document.getElementById('pressPlay');
let categories = [];

$('#pressPlay').on("click", setUp);

$(async function () {
    $('#jeopardyBoard').on('click', 'td', clicking);
});

function loadingScreen() {
    $('#jeopardyHead').empty();
    $('#jeopardyBoard').empty();

    $('#gameBoard').show();
    $('#pressPlay')
        .addClass('disabled')
        .text('Loading...');

}
async function hideLoading() {
    $('#pressPlay')
        .removeClass('disabled')
        .text('Reset');
    $('#gameBoard').hide();
}



async function setUp() {
    let loadingMaybe = $("#pressPlay").text() === "Loading...";

    if (!loadingMaybe) {
        loadingScreen();
        let cateIds = await getCategoryIds();
        categories = [];

        for (let cateId of cateIds) {
            categories.push(await getCategories(cateId));
        }
        buildTable();
    }
}


async function getCategoryIds() {
    let response = await axios.get(`${apiUrl}categories`, {
        params: { count: 100 }
    });
    let cateIds = response.data.map(c => c.id);
    console.log(response);
    return _.sampleSize(cateIds, categoryNum);

}
async function getCategories(cateIds) {
    let response = await axios.get(`${apiUrl}category`, {
        params: { id: cateIds }
    });
    let cat = response.data;
    let randomizedClues = _.sampleSize(cat.clues, clueNum).map(e => ({
        question: e.question,
        answer: e.answer,
        showing: null
    }));
    return { title: cat.title, clues: randomizedClues };
}


function buildTable() {
    hideLoading();
    let row = $("<tr>");
    for (category of categories) {
        row.append($("<th>").text(category.title));
    }
    $("#jeopardyBoard").append(row);

    $("#jeopardyHead").append(row);
    for (let clues = 0; clues < clueNum; clues++) {
        let row = $("<tr>");
    for (let cat_id=0;cat_id<categories.length;cat_id++) {

            
                row.append(
                    $("<td>")
                        .attr("id", `${cat_id}-${clues}`)
                        .append($(`<i>`).addClass(""))
                        .append(`${categories[cat_id].clues[clues].question}`)
                );
            
        }
        $("#jeopardyBoard").append(row);
    }


};

function clicking(evt) {
    let $target = $(evt.target);
    let id = $target.attr("id");
    let [cateId, clueId] = id.split("-");
    let clue = categories[Number(cateId)].clues[Number(clueId)];

    let msg;
    if (!clue.showing) {
        msg = clue.question;
        clue.showing = "question";
    } else if (clue.showing === "question") {
        msg = clue.answer;
        clue.showing = "answer";
        $target.addClass("disabled");
    } else {
        return;
    }
    $target.html(`${msg}`);
}

