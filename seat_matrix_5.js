var comm_perc = [0.31,0.265,0.035,0.2,0.15,0.03,0.01];
var oc = 0.31, bc = 0.265, bcm = 0.035, mbc = 0.2, sc = 0.15, sca = 0.03, st = 0.01;

var input = { "clg1" : { "br1" : 39, "br2" : 27, "br3" : 30 ,"br4": 40} ,
              "clg2" : { "br1" : 32, "br2" : 29, "br3" : 21 ,"br4": 27} , 
            }

var floor_mat = init();
var seat_matrix = init();
var frac_mat = init();
var seat_filled = {}
var adjusted = init();
var branch_frac = {}, branch_abs = {};
var branch_tot_frac = {}, branch_tot_abs = {};
var college_tot_seats = {},total_seats = 0;

// calculating college wise total seats ans overall total seats

for(clg_code in input){
    college_tot_seats[clg_code] = 0;
    for(branch in input[clg_code]){
        college_tot_seats[clg_code] += input[clg_code][branch];
    }
    total_seats += college_tot_seats[clg_code];
}

// rounding the seats

for(clg_code in input){
    for(branch in input[clg_code]){
        let tot_seats = 0;
        for(let i=0;i<7;i++){
            let seats = input[clg_code][branch] * comm_perc[i];
            frac_mat[clg_code][branch][i] = seats;
            if(seats-parseInt(seats) >= 0.5){
                adjusted[clg_code][branch][i] = 1;
            }
            // seats = Math.round(seats);
            floor_mat[clg_code][branch][i] = parseInt(seats);
            tot_seats += (floor_mat[clg_code][branch][i]+adjusted[clg_code][branch][i]);
        }
        if(!seat_filled[clg_code])
          seat_filled[clg_code] = {};
        seat_filled[clg_code][branch] = tot_seats;
    }
}

add_branch_tot();

for(branch in branch_tot_frac){
    left_seats = branch_tot_frac[branch] - branch_tot_abs[branch];
    if(left_seats > 0){
       while(left_seats--){
         add_seat(branch);
       }
    }
    else if(left_seats < 0){
       while(left_seats++){
         remove_seat(branch);
       }
    }
}

create_seat_matrix();
console.log(seat_matrix)
calculate_percentage();

// helper functions

function init(){
    let matrix = {}
    for(clg_code in input){
        matrix[clg_code] = Object.create(input[clg_code]);
        for(branch in matrix[clg_code]){
            matrix[clg_code][branch] = [0,0,0,0,0,0,0];
        }
    }    
    return matrix;
}

function add_branch_tot(){
  for(clg_code in input){
     for(branch in input[clg_code]){
         if(!branch_frac[branch]){
            branch_frac[branch] = [0,0,0,0,0,0,0];
            branch_abs[branch] = [0,0,0,0,0,0,0];
            branch_tot_frac[branch] = 0, branch_tot_abs[branch] = 0;
         }
         for(let i=0;i<7;i++){
             branch_frac[branch][i] += frac_mat[clg_code][branch][i];
             branch_abs[branch][i] += (floor_mat[clg_code][branch][i]+adjusted[clg_code][branch][i]);
             branch_tot_frac[branch] += frac_mat[clg_code][branch][i];
             branch_tot_abs[branch] += (floor_mat[clg_code][branch][i]+adjusted[clg_code][branch][i]);
         }
     }
  }   
  for(branch in branch_tot_frac){
    branch_tot_frac[branch] = Math.round(branch_tot_frac[branch]);
  }
}


function add_seat(branch){

    let order = [];
    for(let i=0;i<7;i++){
        order.push([branch_frac[branch][i] - branch_abs[branch][i],i]);
    }
    order.sort((a,b) => { return b[0]-a[0]; });

    for(let cur = 0; cur<7 ;cur++){
        
        let clgs = find_max_college(branch,order[cur][1]);

        if(clgs.length === 0){
            continue;
        }
        seat_filled[clgs[0][1]][branch] += 1;
        branch_abs[branch][order[cur][1]] += 1;
        adjusted[clgs[0][1]][branch][order[cur][1]] = 1;
        break;
    }
}

function remove_seat(branch){
    let order = [];
    for(let i=0;i<7;i++){
        // console.log(branch_frac[branch][i] - branch_abs[branch][i])
        order.push([branch_frac[branch][i] - branch_abs[branch][i],i]);
    }
    order.sort((a,b) => { return a[0]-b[0]; });

    for(let cur = 0; cur < 7; cur++){
        let clgs = find_min_college(branch,order[cur][1]);
        if(clgs.length === 0){
            continue;
        }
        seat_filled[clgs[0][1]][branch]--;
        branch_abs[branch][order[cur][1]]--;
        adjusted[clgs[0][1]][branch][order[cur][1]] = 0;
        break;
    }
}


function find_min_college(branch,comm){
    let min_clgs = [];
    for(clg_code in frac_mat){
      if(frac_mat[clg_code][branch]){
        if(adjusted[clg_code][branch][comm] === 1 && seat_filled[clg_code][branch] > input[clg_code][branch]){
            let fr = frac_mat[clg_code][branch][comm];
            min_clgs.push([fr-parseInt(fr),clg_code]);
        }
      }
    }

    min_clgs.sort((a,b) => { return a[0]-b[0]; });
    return min_clgs;
}

function find_max_college(branch,comm){
    let max_clgs = [];
    for(clg_code in frac_mat){
      if(frac_mat[clg_code][branch]){
        
        if(adjusted[clg_code][branch][comm] != 1 && seat_filled[clg_code][branch] < input[clg_code][branch]){
            let fr = frac_mat[clg_code][branch][comm];
            max_clgs.push([fr-parseInt(fr),clg_code]);
        }
      }
    }

    max_clgs.sort((a,b) => { return b[0]-a[0]; });

    // console.log(max_clgs)
    return max_clgs;
}

function create_seat_matrix(){
    for(clg_code in seat_matrix){
        for(branch in seat_matrix[clg_code]){
            for(let i=0;i<7;i++){
                seat_matrix[clg_code][branch][i] = floor_mat[clg_code][branch][i] + adjusted[clg_code][branch][i];
            }
        }
    }
}

function calculate_percentage(){
    let clg_perc_lst = {};
    for(clg_code in seat_matrix){
        clg_perc_lst[clg_code] = [0,0,0,0,0,0,0];
        for(branch in seat_matrix[clg_code]){
            for(let i=0;i<7;i++){
                clg_perc_lst[clg_code][i] += (seat_matrix[clg_code][branch][i]);
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

