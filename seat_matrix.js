var comm_perc = [0.31,0.265,0.035,0.2,0.15,0.03,0.01];
var oc = 0.31, bc = 0.265, bcm = 0.035, mbc = 0.2, sc = 0.15, sca = 0.03, st = 0.01;

var input = { "clg1" : { "br1" : 50, "br2" : 60, "br3" : 70 } ,
              "clg2" : { "br1" : 45, "br2" : 50, "br3" : 60 } , 
              "clg3" : { "br1" : 60, "br2" : 70, "br3" : 80, "br4" : 70 },
}

var total_seats = calculateTotOverall(input);

// Driver code

var seat_matrix = init();
var dif_array = init();
var adjustments = init();
var college_tot_seats = calculate_clg_tot_seats();

set_abs_seats();
calculate_dif_arr();

var order = [6,5,2,4,3,1,0];

var comm_minor_clg_ord = [];
var comm_minor_dpt_ord = [];

for(let i=0;i<7;i++){
  comm_minor_clg_ord[i] = [];
  comm_minor_dpt_ord[i] = {};
}

calculate_clg_initial_order();

for(let i=0;i<7;i++){
    comm_minor_clg_ord[i].sort( (a,b) => {
        return a["perc"] - b["perc"];
    })
}

calculate_dpt_initial_order();

for(let i=0;i<7;i++){
   for(clg_code in comm_minor_dpt_ord[i]){
       comm_minor_dpt_ord[i][clg_code].sort((a,b) =>{
           return a["perc"] - b["perc"];
       })
   }
}

var comm_left_over_seats = calculate_comm_leftOver();

for(comm of order){ 

  console.log(comm);

  while(comm_left_over_seats[comm] >= 1){
    
    let clg = comm_minor_clg_ord[comm][0];

    if(comm_minor_clg_ord[comm].length === 0) break;

    if(!clg){
        comm_minor_clg_ord[comm].splice(0,1);
        continue;
    }

    let dpt = comm_minor_dpt_ord[comm][clg.code][0];

    if(dif_array[clg.code][dpt.branch] >= 1 && adjustments[clg.code][dpt.branch][comm] != 1){
        adjustments[clg.code][dpt.branch][comm] = 1;
        dif_array[clg.code][dpt.branch]--;
        comm_left_over_seats[comm]--;
    
        update_clg_perc(comm,clg.code,dpt.branch);
        update_dpt_perc(comm,clg.code,dpt.branch);
    }
    else{
        comm_minor_dpt_ord[comm][clg.code].splice(0,1);

        if(comm_minor_dpt_ord[comm][clg.code].length === 0){
            comm_minor_clg_ord[comm].splice(0,1);
        }
    }

//    console.log(comm_minor_clg_ord[comm]);
    console.log(comm_minor_dpt_ord[comm]);

  }

}

// calculate_percentage();


// Helper functions

function init(){
    let seat_mat = {}
    for(clg_code in input){
        seat_mat[clg_code] = Object.create(input[clg_code]);
        for(branch in seat_mat[clg_code]){
            seat_mat[clg_code][branch] = [0,0,0,0,0,0,0];
        }
    }    
    return seat_mat;
}

function calculate_clg_tot_seats(){
    let clg_tot = {};
    for(clg_code in input){
        clg_tot[clg_code] = 0;
        for( branch in input[clg_code] ){
            clg_tot[clg_code] += input[clg_code][branch]; 
        }
    }
    return clg_tot;
}

function set_abs_seats(){
    for(clg_code in input){
        for(branch in input[clg_code]){
            for(let i=0;i<7;i++){
                seat_matrix[clg_code][branch][i] = parseInt(comm_perc[i]*input[clg_code][branch]);
            }
        }
    }
}

function calculate_comm_leftOver(){
    let lst = [0,0,0,0,0,0,0];
    for(clg_code in input){
        for(branch in input[clg_code]){
            for(let i=0;i<7;i++){
              lst[i] = lst[i] + parseFloat(input[clg_code][branch]*comm_perc[i])-parseInt(input[clg_code][branch]*comm_perc[i]);            
            }
        }
    }
   return lst;
}

function calculate_dif_arr(){
    for(clg_code in dif_array){
        for(branch in dif_array[clg_code]){
            let tot = input[clg_code][branch];
            dif_array[clg_code][branch] = tot - (parseInt(oc*tot)+parseInt(bc*tot)+parseInt(bcm*tot)+parseInt(mbc*tot)+parseInt(sc*tot)+parseInt(sca*tot)+parseInt(st*tot));
        }
    }
}

function calculate_clg_initial_order(){
    for(clg_code in input){
        for(let i=0;i<7;i++){
            comm_minor_clg_ord[i].push({
                "code" : clg_code,
                "perc" : findSeatTotal(seat_matrix[clg_code],i) / findTotal(input[clg_code])
            });
       } 
    }
}

function calculate_dpt_initial_order(){
    for(clg_code in input){
        for(let i=0;i<7;i++) comm_minor_dpt_ord[i][clg_code] = [];
        for(branch in input[clg_code]){
            for(let i=0;i<7;i++){
                comm_minor_dpt_ord[i][clg_code].push({
                    "branch" : branch,
                    "perc" : seat_matrix[clg_code][branch][i] / input[clg_code][branch],
                });
            }
        }
    }
}

function update_clg_perc(comm,clg_code,branch){

    let seats_filled = 0;
    for(branch in seat_matrix[clg_code]){
         seats_filled += seat_matrix[clg_code][branch][comm]+adjustments[clg_code][branch][comm];
    }

    comm_minor_clg_ord[comm][0]["perc"] = seats_filled / college_tot_seats[clg_code];

    comm_minor_clg_ord[comm].sort( (a,b) => {
        return a["perc"] - b["perc"];
    });

    // console.log(comm_minor_clg_ord[comm][0]); 
}

function update_dpt_perc(comm,clg_code,branch){
    
    let seats_filled = seat_matrix[clg_code][branch][comm]+adjustments[clg_code][branch][comm];
    
    comm_minor_dpt_ord[comm][clg_code][0]["perc"] = seats_filled / input[clg_code][branch];

    comm_minor_dpt_ord[comm][clg_code].sort((a,b) =>{
        return a["perc"] - b["perc"];
    })

    //   console.log(comm_minor_dpt_ord[comm][clg_code][0]);
}

function calculateTotOverall(input){
    let tot = 0;
    for(clg_code in input){
        for(branch in input[clg_code]){
            tot += input[clg_code][branch];
        }
    }
    return tot;
}

function findSeatTotal(obj,comm){
    let sum = 0;
    for(key in obj){
        sum = sum + parseInt(obj[key][comm]);
    }
    return sum;
}

function findTotal(obj){
    let sum = 0;
    for(key in obj){
        sum = sum + parseInt(obj[key]);
    }
    return sum;
}

function calculate_percentage(){
    let clg_perc_lst = {};
    for(clg_code in seat_matrix){
        clg_perc_lst[clg_code] = [0,0,0,0,0,0,0];
        for(branch in seat_matrix[clg_code]){
            for(let i=0;i<7;i++){
                clg_perc_lst[clg_code][i] += seat_matrix[clg_code][branch][i] + adjustments[clg_code][branch][i];
            }
        } 
    }

   let overall_perc_lst = [0,0,0,0,0,0,0];

   for(clg_code in clg_perc_lst){
       for(let i=0;i<7;i++){
          overall_perc_lst[i] += clg_perc_lst[clg_code][i];
       }
   }

   for(let i=0;i<7;i++){
       overall_perc_lst[i] = (overall_perc_lst[i] / total_seats) * 100;
   }

   for(clg_code in clg_perc_lst){
       for(let i=0;i<7;i++){
            clg_perc_lst[clg_code][i] =  (clg_perc_lst[clg_code][i] / college_tot_seats[clg_code]) * 100;
       }
   }

   console.log(clg_perc_lst);
   console.log(overall_perc_lst);

}
