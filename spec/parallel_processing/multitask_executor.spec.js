var stream = require('stream'),
    Q      = require('q');

var utils          = require_src('utils/index'),
    MultiTaskExecutor = require_src('parallel_processing/multitask_executor');

describe('MultiTaskExecutor', function() {
  var runner = {
    addJob: function(fn) { fn(); }
  };

  describe('when processing simple functions or simple values', function() {
    it('completes on the values or function returned values', function(done) {
      new MultiTaskExecutor([
        function() { return function() { return 123; }; },
        function() { return 'abc'; }
      ]).runWith(runner)
      .then(function(data) {
        expect(data[0].value).toEqual(123);
        expect(data[1].value).toEqual('abc');
        done();
      });
    });
  });

  describe('when processing promises or functions returning promises', function() {
    it('completes on the fulfilled values', function(done) {
      new MultiTaskExecutor([
        function() { return function() { return Q(123); }; },
        function() { return Q('abc'); }
      ]).runWith(runner)
      .then(function(data) {
        expect(data[0].value).toEqual(123);
        expect(data[1].value).toEqual('abc');
        done();
      });
    });
  });

  describe('when processing streams', function() {
    it('completes on the promise created from the stream', function(done) {
      spyOn(utils.stream, 'streamToPromise').and.returnValue(Q('test-stream'));
      var s = new stream.Readable();
      new MultiTaskExecutor([
        function() { return s; }
      ]).runWith(runner)
      .then(function(data) {
        expect(utils.stream.streamToPromise).toHaveBeenCalledWith(s);
        expect(data[0].value).toEqual('test-stream');
        done();
      });
    });
  });
});
