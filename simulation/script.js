// Instructions modal logic
const modal = document.getElementById("instructionsModal");
const btn = document.getElementById("openInstructions");

btn.onclick = () => { modal.style.display = "block"; }

window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }

// Existing calculation logic remains unchanged
document.getElementById('calcButton').addEventListener('click', function () {

    const E = parseFloat(document.getElementById('E').value);
    const V = parseFloat(document.getElementById('V').value);
    const Pmec = parseFloat(document.getElementById('Pmec').value);

    const Xt = parseFloat(document.getElementById('Xt').value);
    const X1 = parseFloat(document.getElementById('X1').value);
    const X2 = parseFloat(document.getElementById('X2').value);

    const H = parseFloat(document.getElementById('H').value);
    const f = parseFloat(document.getElementById('f').value);
    const tStep = parseFloat(document.getElementById('tStep').value);
    const faultTime = parseFloat(document.getElementById('faultTime').value);
    const clearTime = parseFloat(document.getElementById('clearTime').value);

    const Xpre = Xt + ((X1 * X2) / (X1 + X2));
    const Xpost = Xt + X1;

    const d = Array.from({ length: 51 }, (_, i) => i * Math.PI / 50);

    const P = d.map(delta => (E * V / Xpre) * Math.sin(delta));
    const PeFault = d.map(() => 0);
    const Pme = d.map(() => Pmec);
    const PePost = d.map(delta => (E * V / Xpost) * Math.sin(delta));

    const Ppremax = (E * V / Xpre);
    const Pdurmax = 0;
    const Ppostmax = (E * V / Xpost);

    const swingCurve = Math.asin(Pmec / Ppremax) * (180 / 3.14);
    console.log("criticalAngle:", swingCurve);

    const Time = 5;
    const T = Math.floor(Time / tStep);

    let wr = new Array(T + 1).fill(0);
    let del = new Array(T + 1).fill(swingCurve);
    let tt = new Array(T + 1).fill(0);
    let Pmax = new Array(T + 1).fill(0);
    let wrd = new Array(T + 1).fill(2 * Math.PI * f);

    const tf = Math.round((faultTime / Time) * T);
    const tc = Math.round(((faultTime + clearTime) / Time) * T);

    for (let n = 0; n < T; n++) {
        if (n < tf) {
            Pmax[n] = Ppremax;
        } else if (n >= tf && n < tc) {
            Pmax[n] = 0;
        } else {
            Pmax[n] = Ppostmax;
        }

        let k1d = ((Pmec / (2 * H)) - (Pmax[n] / (2 * H)) * Math.sin((del[n] * Math.PI) / 180)) * tStep;
        let k1dd = (2 * 3.14159 * f * wr[n]) * tStep;

        let k2d = ((Pmec / (2 * H)) - (Pmax[n] / (2 * H)) * Math.sin(((del[n] * Math.PI) / 180) + k1dd)) * tStep;
        let k2dd = (2 * 3.14159 * f * (wr[n] + k1d)) * tStep;

        tt[n + 1] = tt[n] + tStep;
        wr[n + 1] = wr[n] + (k1d + k2d) / 2;
        del[n + 1] = del[n] + ((180 / Math.PI) * (k1dd + k2dd)) / 2;
        wrd[n + 1] = 2 * Math.PI * f + 2 * Math.PI * f * wr[n];
    }

    document.getElementById('faultSection').style.display = 'block';


    const ctx1 = document.getElementById('powerCurve').getContext('2d');

    // new Chart(ctx1, {
    //     type: 'line',
    //     data: {
    //         labels: d.map(delta => (delta * 180 / Math.PI).toFixed(2)),
    //         datasets: [
    //             { label: 'Pmechanical', data: Pme, borderColor: 'black', fill: false },
    //             { label: 'Pre-fault', data: P, borderColor: 'blue', fill: false },
    //             { label: 'During Fault', data: PeFault, borderColor: 'red', fill: false },
    //             { label: 'Post-fault', data: PePost, borderColor: 'green', fill: false }
    //         ]
    //     },
    //     options: {
    //         responsive: true,
    //         scales: {
    //             x: { 
    //                 title: { display: true, text: 'Load Angle (Degrees)' },
    //                 ticks: {
    //                     callback: function(value) {
    //                         return parseFloat(value).toFixed(2);
    //                     }
    //                 }
    //             },
    //             y: { 
    //                 title: { display: true, text: 'Power (pu)' },
    //                 ticks: {
    //                     callback: function(value) {
    //                         return parseFloat(value).toFixed(2);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // });
    new Chart(ctx1, {
        type: 'line',
        data: {
            //labels: d.map(delta => Math.round(delta * 180 / Math.PI)),
            labels: d.map(delta => (delta * 180 / Math.PI).toFixed(1)),

            datasets: [
                { label: 'Pmechanical', data: Pme, borderColor: 'black', fill: false },
                { label: 'Pre-fault', data: P, borderColor: 'blue', fill: false },
                { label: 'During Fault', data: PeFault, borderColor: 'red', fill: false },
                { label: 'Post-fault', data: PePost, borderColor: 'green', fill: false }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Load Angle (Degrees)' },
                    min: 0,
                    max: 180,
                },
                y: {
                    title: { display: true, text: 'Power (pu)' }
                }
            }
        }
    });


    const ctx2 = document.getElementById('swingCurve').getContext('2d');
    // new Chart(ctx2, {
    //     type: 'line',
    //     data: {
    //         labels: tt.map(t => t.toFixed(2)),
    //         datasets: [
    //             { label: 'Swing Curve', data: del, borderColor: 'purple', fill: false }
    //         ]
    //     },
    //     options: {
    //         responsive: true,
    //         scales: {
    //             x: { 
    //                 title: { display: true, text: 'Time (s)' },
    //                 ticks: {
    //                     callback: function(value) {
    //                         return parseFloat(value).toFixed(2);
    //                     }
    //                 }
    //             },
    //             y: { 
    //                 title: { display: true, text: 'Load Angle (Degrees)' },
    //                 ticks: {
    //                     callback: function(value) {
    //                         return parseFloat(value).toFixed(2);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // });
    new Chart(ctx2, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Swing Curve',
                data: tt.map((t, i) => ({ x: t, y: del[i] })),
                borderColor: 'purple',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    min: 0,
                    max: 5,
                    title: { display: true, text: 'Time (s)' },

                    afterBuildTicks: function (scale) {
                        const divisions = 33; // number of divisions you want
                        const step = scale.max / divisions; // step size
                        scale.ticks = [];

                        for (let i = 1; i <= divisions; i++) {   // start from 1 instead of 0
                            scale.ticks.push({
                                value: +(i * step).toFixed(3) // round to 3 decimal places
                            });
                        }
                    },

                    ticks: {
                        callback: function (value) {
                            return value.toFixed(3);  // display 3 decimal places
                        }
                    }
                }

                ,
                y: {
                    title: { display: true, text: 'Load Angle (Degrees)' }
                }
            }
        }
    });


const ctx3 = document.getElementById('fCurve').getContext('2d');
    // new Chart(ctx3, {
    //     type: 'line',
    //     data: {
    //         labels: tt.map(t => t.toFixed(2)),
    //         datasets: [
    //             { label: 'Frequency Curve', data: wrd, borderColor: 'blue', fill: false }
    //         ]
    //     },
    //     options: {
    //         responsive: true,
    //         scales: {
    //             x: {
    //                 title: { display: true, text: 'Time (s)' },
    //                 ticks: {
    //                     callback: function (value) {
    //                         return parseFloat(value).toFixed(2);
    //                     }
    //                 }
    //             },
    //             y: {
    //                 title: { display: true, text: 'Angular frequency (Hz)' },
    //                 ticks: {
    //                     callback: function (value) {
    //                         return parseFloat(value).toFixed(2);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // });

    new Chart(ctx3, {
    type: 'line',
    data: {
        datasets: [{
            label: 'Frequency Curve',
            data: tt.map((t, i) => ({ x: t, y: wrd[i] })),
            borderColor: 'blue',
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                type: 'linear',
                min: 0,
                max: 5,
                title: { display: true, text: 'Time (s)' },

                afterBuildTicks: function (scale) {
                    const divisions = 33;
                    const step = scale.max / divisions;
                    scale.ticks = [];

                    for (let i = 1; i <= divisions; i++) {
                        scale.ticks.push({
                            value: +(i * step).toFixed(3)
                        });
                    }
                },

                ticks: {
                    callback: function (value) {
                        return value.toFixed(3);
                    }
                }
            },
            y: {
                title: { display: true, text: 'Angular Frequency (Hz)' },
                ticks: {
                    callback: function (value) {
                        return value;
                    }
                }
            }
        }
    }
});


});