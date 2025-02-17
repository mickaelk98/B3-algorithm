const numbers = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000)); // 1000 nombres aléatoires

const nonsortedArrayContainer = document.querySelector(".nonsortedarray");
const sortedArrayContainer = document.querySelector(".sortedarray");
const algoNameDisplay = document.querySelector(".algoname");
const timeDisplay = document.querySelector(".time");


function displayPartialArray(container, array) {
    const first50 = array.slice(0, 50).join(", ");
    container.innerHTML = `${first50} <span class="showMore text-blue-500 cursor-pointer">...</span>`;

    container.querySelector(".showMore").addEventListener("click", () => {
        container.textContent = array.join(", ");
    });
}


displayPartialArray(nonsortedArrayContainer, numbers);


function sortAndDisplay(name, algo) {
    const arrayCopy = [...numbers];
    const start = performance.now();
    const sortedArray = algo(arrayCopy);
    const end = performance.now();


    algoNameDisplay.textContent = `Algorithme : ${name}`;
    timeDisplay.textContent = `Temps : ${(end - start).toFixed(2)} ms`;

    displayPartialArray(sortedArrayContainer, sortedArray);
}

// Algorithmes de tri 
function bubbleSort(arr) {
    let n = arr.length;
    let swapped;
    do {
        swapped = false;
        for (let i = 0; i < n - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                swapped = true;
            }
        }
        n--;
    } while (swapped);
    return arr;
}

function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}

function selectionSort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
    return arr;
}

function quickSort(arr) {
    if (arr.length <= 1) return arr;
    let pivot = arr[arr.length - 1];
    let left = [];
    let right = [];
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] < pivot) left.push(arr[i]);
        else right.push(arr[i]);
    }
    return [...quickSort(left), pivot, ...quickSort(right)];
}

function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    let mid = Math.floor(arr.length / 2);
    let left = mergeSort(arr.slice(0, mid));
    let right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    while (left.length && right.length) {
        if (left[0] < right[0]) result.push(left.shift());
        else result.push(right.shift());
    }
    return [...result, ...left, ...right];
}

// Ajout des événements sur les boutons
document.getElementById("bubbleSort").addEventListener("click", () => sortAndDisplay("Tri à bulles", bubbleSort));
document.getElementById("insertionSort").addEventListener("click", () => sortAndDisplay("Tri par insertion", insertionSort));
document.getElementById("selectionSort").addEventListener("click", () => sortAndDisplay("Tri par sélection", selectionSort));
document.getElementById("quickSort").addEventListener("click", () => sortAndDisplay("Tri rapide", quickSort));
document.getElementById("mergeSort").addEventListener("click", () => sortAndDisplay("Tri fusion", mergeSort));
