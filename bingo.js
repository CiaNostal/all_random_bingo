window.bingo_card_width = 5;
window.bingo_card_height = 5;
window.bingo_card_center_index = Math.floor(bingo_card_width * bingo_card_height / 2);
window.bingo_num_min = 0;
window.bingo_num_max = 49;
window.bingo_card_cell_num = bingo_card_width * bingo_card_height;
window.card_holes = [];
window.is_created_card = false;
window.card_bingo_num = 0;
window.card_reach_num = 0;
window.card_reach_indexes = 0;
window.player_name = '';
window.is_daily = true;
window.center_str = 'KUMA';
window.is_enabled_center_kuma = true;
window.storage_key = "salmonrun_all_random"
window.dom = {};
window.click_event = 'ontouchend' in window ? 'ontouchend' : 'onclick';
const weapon_img_array = ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "200", "210", "220", "230", "240", "250", "300", "310", "400", "1000", "1010", "1020", "1030", "1100", "1110", "2000", "2010", "2020", "2030", "2040", "2050", "2060", "3000", "3010", "3020", "3030", "3040", "4000", "4010", "4020", "4030", "4040", "5000", "5010", "5020", "5030", "5040", "6000", "6010", "6020"]
window.save_variables = [
    'card', 'card_holes', 'player_name', 'player_code', 'kuma_weapon',
    'is_enabled_center_kuma', 'bingo_num_min', 'bingo_num_max', "is_created_card"
];
window.check_bingo_configs = [{
        line_num: bingo_card_width,
        start: (i) => { return i },
        step: bingo_card_width,
        len: bingo_card_height,
    },
    {
        line_num: bingo_card_height,
        start: (i) => { return i * bingo_card_width },
        step: 1,
        len: bingo_card_width,
    },
    {
        line_num: 1,
        start: (i) => { return 0 },
        step: bingo_card_width + 1,
        len: bingo_card_width,
    },
    {
        line_num: 1,
        start: (i) => { return bingo_card_width - 1 },
        step: bingo_card_width - 1,
        len: bingo_card_width,
    },
];

window.onload = () => {
    load_storage();
    let kuma_weapon;
    if (typeof window.kuma_weapon === 'undefined') {
        kuma_weapon = "7000";
    } else {
        kuma_weapon = window.kuma_weapon;
    }
    console.log(window.card);
    console.log(window.card_holes);
    console.log("kuma_weapon is " + kuma_weapon);
    document.getElementById('kuma-weapon').value = kuma_weapon;
    dom.bingo_card_table = document.querySelector('.bingo-card-table-wrapper table');
    dom.bingo_card_cells = dom.bingo_card_table.querySelectorAll('td');
    dom.bingo_card_name = document.querySelector('.bingo-card-name');
    dom.create_card_button = document.querySelector('.create-card-button');
    dom.chromakey_setting = document.getElementById('chromakey');
    for (let i = 0; i < bingo_card_cell_num; i++) {
        dom.bingo_card_cells[i].setAttribute('cell-index', i);
        dom.bingo_card_cells[i][click_event] = cell_click;
    }
    dom.create_card_button[click_event] = create_card_button_click;
    dom.chromakey_setting[click_event] = chromakey_setting_click;
    render_card(card);
    for (let i = 0; i < card.length; i++) {
        if (window.card_holes[i]) {
            dom.bingo_card_cells[i].classList.add('hole');
        }
    }
    update();
}

/*
 * chromakey_setting_click()
 */
function chromakey_setting_click() {
    let checkbox = document.getElementById('chromakey');
    let bingo_card_tables = document.querySelectorAll(".bingo-card-table-wrapper table td");
    for (let i = 0; i < bingo_card_tables.length; i++) {
        if (checkbox.checked) {
            bingo_card_tables[i].style.backgroundColor = "#00FF00";
        } else {
            bingo_card_tables[i].style.backgroundColor = "white";
        }
    }
    let bingo_card_outer = document.querySelector(".bingo-card-outer");
    if (checkbox.checked) {
        bingo_card_outer.style.width = "28em";
        bingo_card_outer.style.height = "29em";
        bingo_card_outer.style.paddingTop = "2px";
        bingo_card_outer.style.backgroundColor = "#dddbdb";
        //bingo_card_outer.style.backgroundImage = "";
        bingo_card_outer.style.backgroundSize = "1%";
    } else {
        bingo_card_outer.style.width = "37em";
        bingo_card_outer.style.height = "41em";
        bingo_card_outer.style.paddingTop = "183px";
        bingo_card_outer.style.backgroundColor = "";
        bingo_card_outer.style.backgroundImage = "url(background.png)";
        bingo_card_outer.style.backgroundSize = "110%";
    }
}

/*
 * create_card_button_click()
 */
function create_card_button_click() {
    if (bingo_num_max - bingo_num_min + 1 < 25) {
        my_alert({
            title: 'エラー',
            message: 'ビンゴカードの数字は<br>25個通り以上必要です。',
        });
        return;
    }
    init_bingo();
}

/* 
 * cell_click()
 */
function cell_click() {
    if (!is_created_card) {
        return;
    }
    let cell_index = parseInt(this.getAttribute('cell-index'));
    let is_hole = card_holes[cell_index];
    if (!is_hole) {
        card_holes[cell_index] = true;
        this.classList.add('hole');
        update(true);
    } else {
        card_holes[cell_index] = false;
        this.classList.remove('hole');
        update(false);
    }
    // console.log(card_holes)
}


/* 
 * update()
 */
function update(is_create_hole) {
    save_storage();
    let [bingo_num, reach_num, reach_indexes] = check_bingo(card_holes);
    if (is_create_hole && bingo_num > 0 && card_bingo_num < bingo_num) {
        let message = bingo_num + 'ビンゴです!';
        if (bingo_num === 1) message = 'おめでとうございます!';
        my_alert({
            title: 'BINGO!',
            message: message,
        });
    } else if (is_create_hole && reach_num > 0 && card_reach_num < reach_num) {
        my_alert({
            title: 'REACH!',
            message: reach_num + 'リーチになりました!'
        });
    }
    for (let i = 0; i < bingo_card_cell_num; i++) {
        dom.bingo_card_cells[i].classList.remove('reach');
        if (reach_indexes.indexOf(i) > -1) {
            dom.bingo_card_cells[i].classList.add('reach');
        }
    }
    card_bingo_num = bingo_num;
    card_reach_num = reach_num;
    card_reach_indexes = reach_indexes;
}

/* 
 * check_bingo(_card_holes)
 */
function check_bingo(_card_holes) {
    let bingo_num = 0;
    let reach_num = 0;
    let reach_indexes = [];
    for (let i_cfg = 0; i_cfg < check_bingo_configs.length; i_cfg++) {
        let cfg = check_bingo_configs[i_cfg];
        for (let i = 0; i < cfg.line_num; i++) {
            let flag = true;
            let hole_num = 0;
            let not_hole_index = -1;
            for (let j = 0; j < cfg.len; j++) {
                let index = cfg.start(i) + j * cfg.step;
                if (!_card_holes[index]) {
                    not_hole_index = index;
                } else {
                    hole_num++;
                }
            }
            if (hole_num === cfg.len) {
                bingo_num++;
            } else if (hole_num === cfg.len - 1) {
                reach_indexes.push(not_hole_index);
                reach_num++;
            }
        }
    }
    // ビンゴせず
    return [bingo_num, reach_num, reach_indexes];
}


/*
 * init_bingo(is_load)
 */
function init_bingo(is_load) {
    console.log('init bingo');
    if (bingo_num_max - bingo_num_min + 1 < 25) {
        my_alert({
            title: 'エラー',
            message: 'ビンゴカードの数字は<br>25個通り以上必要です。',
        });
        return;
    }
    // player_name = dom.player_name_input.value;
    if (!is_load) {
        player_code = str_2_int(player_name);
        if (player_code === 0) {
            player_code = new Date().getTime();
        }
        if (is_daily) {
            player_code += get_date_code();
        }
    }
    let xors = new Xors(player_code);
    init_card(xors, is_load);
    is_created_card = true;
    card_bingo_num = 0;
    card_reach_num = 0;
    card_reach_indexes = 0;
    save_storage();
    // console.log(card)
    // console.log(card_holes)
}


/* 
 * render_card(_card)
 */
function render_card(_card) {
    let html = '';
    for (let i = 0; i < _card.length; i++) {
        let str = _card[i];
        // 削除
        dom.bingo_card_cells[i].querySelectorAll('*').forEach(n => n.remove());
        let img_element = document.createElement('img');
        img_element.src = "./weapons_big/" + weapon_img_array[Number(str)] + ".png";
        img_element.width = 80
        if (str == center_str) {
            kuma_weapon = document.getElementById("kuma-weapon").value;
            img_element.src = "./weapons_big/" + kuma_weapon + ".png";
        }
        // dom.bingo_card_cells[i].textContent = "";
        dom.bingo_card_cells[i].appendChild(img_element);

    }
}

/* 
 * init_card()
 */
function init_card(xors, is_load) {
    card = create_card(xors);
    if (!is_load) {
        card_holes = create_card_holes();
        // console.log(card_holes.length)
    }
    for (let i = 0; i < bingo_card_cell_num; i++) {
        dom.bingo_card_cells[i].classList.remove('hole');
        dom.bingo_card_cells[i].classList.remove('reach');
    }
    render_card(card);
}


/* 
 * create_card()
 */
function create_card(xors) {
    let balls_for_card = [];
    for (let i = 0; i <= bingo_num_max - bingo_num_min; i++) {
        balls_for_card.push(bingo_num_min + i);
    }
    let new_card = [];
    for (let i = 0; i < bingo_card_cell_num; i++) {
        let r = Math.floor(xors.random() * balls_for_card.length);
        let num = balls_for_card[r];
        balls_for_card.splice(r, 1);
        new_card[i] = num;
    }
    dom.bingo_card_cells[bingo_card_center_index].classList.remove('kuma');
    if (is_enabled_center_kuma) {
        dom.bingo_card_cells[bingo_card_center_index].classList.add('kuma');
        new_card[bingo_card_center_index] = center_str;
    }
    return new_card;
}

/* 
 * create_card_holes()
 */
function create_card_holes() {
    let new_card_holes = [];
    for (let i = 0; i < card_bingo_num; i++) {
        new_card_holes[i] = false;
    }
    // cardに穴は空いていない（すべてfalseの配列）
    return new_card_holes;
}

/* 
 * save_storage()
 */
function save_storage() {
    let save_data_obj = {};
    window.save_variables.map(var_name => {
        save_data_obj[var_name] = window[var_name];
    });
    let json_str = JSON.stringify(save_data_obj);
    //console.log(json_str);
    localStorage.setItem(window.storage_key, json_str);
    console.log('-- save variables');
}

/* 
 * load_storage()
 */
function load_storage() {
    let json_str = localStorage.getItem(window.storage_key);
    if (json_str !== null) {
        console.log('-- storage data exist');
        console.log('-- merging storage variables to window');
        //console.log(json_str);
        let save_data_obj = JSON.parse(json_str);
        window.save_variables.map(var_name => {
            if (typeof save_data_obj[var_name] !== 'undefined') {
                window[var_name] = save_data_obj[var_name];
            }
        });
    } else {
        console.log('-- storage data doesn\'t exist');
    }
}

/* 
 * str_2_int()
 */
function str_2_int(str) {
    let ret = 0;
    for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        ret += c * (i << 10);
    }
    return ret;
}

/* 
 * get_date_code()
 */
function get_date_code() {
    let offset_time = new Date().getTime() - 5 * 60 * 60 * 1000;
    let offset_date = new Date(offset_time);
    let str = '' +
        offset_date.getFullYear() +
        (offset_date.getMonth() + 1) +
        offset_date.getDate();
    return parseInt(str);
}

/* 
 * Xors(n)
 */
function Xors(n) {
    let x, y, z, w;
    this.seed = function(n) {
        x = 123456789;
        y = 362436069;
        z = 521288629;
        w = n || 88675123;
    };
    this.random = function() {
        let t;
        t = x ^ (x << 11);
        x = y;
        y = z;
        z = w;
        w = (w ^ (w >> 19)) ^ (t ^ (t >> 8));
        return (w % 1E5) / 1E5;
    };
    this.seed(n);
};

/* 
 * my_alert(opt)
 */
function my_alert(opt) {
    console.log(opt)
}

function test() {
    dom.bingo_card_cells[0].style.backgroundImage = "url(./weapons_big/" + weapon_img_array[10] + ".png)"
}