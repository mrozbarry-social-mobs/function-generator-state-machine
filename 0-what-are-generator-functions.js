function *thisIsAGeneratorFunction() {
  yield true;
}

const thisIsAGeneratorFunctionValue = thisIsAGeneratorFunction();
// What is `value`?
console.log('result of a generator', thisIsAGeneratorFunctionValue);

// What does .next() do
console.log('result of a generator .next() method', thisIsAGeneratorFunctionValue.next());

// If you only yield one result, what happens the second time you call .next()?
console.log('result of a generator .next() method (second time)', thisIsAGeneratorFunctionValue.next());

function *thisIsABetterGeneratorFunction() {
  yield 1;
  yield 2;
  yield 3;
}

// Function generators _generate_ programatic iterators
console.log([...thisIsABetterGeneratorFunction()]);

function *thisIsProbablyTheRightUseForAGeneratorFunction() {
  let number = 1;
  while (true) {
    yield number;
    number++;
  }
}

// Probably don't create arrays from infinite generators, though, you will run out of memory
console.log([...thisIsProbablyTheRightUseForAGeneratorFunction()]);

// You can also send values into a generator
function *generatorThatCanAcceptIncomingData() {
  const outgoing = 'hello';
  const incoming = yield outgoing;
  console.log('incoming to generator', incoming);
}
const { value } = generatorThatCanAcceptIncomingData().next('world');
console.log('outgoing from generator', value);
