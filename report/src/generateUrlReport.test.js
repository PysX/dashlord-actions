// @ts-nocheck

const fs = require("fs");
const generateUrlReport = require("./generateUrlReport");

jest.mock("fs");

const testUrl = "https://www.test.com";
const b64 = "aHR0cHM6Ly93d3cudGVzdC5jb20=";

// mock a json in the latest scan
const mockJson = (name, data) =>
  jest.mock(
    `results/${b64}/9876/${name}`,
    () =>
      data
        ? data
        : {
            data: name,
          },
    { virtual: true }
  );

// for some reason jest.resetModules doesnt work with virtual JSON mocks
const unMockJson = (name) => {
  jest.unmock(`results/${b64}/9876/${name}`);
};

describe("generateUrlReport", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test(`should return null on invalid url`, () => {
    expect(
      generateUrlReport({
        url: "https://www.invalid.com",
      })
    ).toEqual(null);
  });

  test(`should generate latest report for a valid url`, () => {
    fs.existsSync.mockImplementationOnce(() => true); // check url folder
    fs.existsSync.mockImplementationOnce(() => false); // screenshot
    fs.readdirSync.mockImplementationOnce(() => ["9876", "1234", "5678"]); // assume scans folders use a sortable date-format

    // mock all required files
    mockJson("codescanalerts.json", {report: "codescanalerts.json", totalCount: 42});
    mockJson("dependabotalerts.json", {report: "dependabotalerts.json"});
    mockJson("http.json", {report: "http.json"});
    mockJson("lhr.json", {report: "lhr.json"});
    mockJson("nmapvuln.json", {report: "nmap.json"});
    mockJson("nuclei.json", [{report: "nuclei.json"}]);
    mockJson("testssl.json", [{report: "testssl.json"}]);
    mockJson("thirdparties.json", {report: "thirdparties.json"});
    mockJson("updownio.json", {report: "updownio.json"});
    mockJson("wappalyzer.json", {report: "wappalyzer.json"});
    mockJson("zap.json", {report: "zap.json"});

    expect(
      generateUrlReport({
        url: testUrl,
      })
    ).toMatchSnapshot();

    // unmock all required files
    unMockJson("codescanalerts.json");
    unMockJson("dependabotalerts.json");
    unMockJson("http.json");
    unMockJson("lhr.json");
    unMockJson("nmapvuln.json");
    unMockJson("nuclei.json", []);
    unMockJson("testssl.json");
    unMockJson("thirdparties.json");
    unMockJson("updownio.json");
    unMockJson("wappalyzer.json");
    unMockJson("zap.json");
  });
  test(`should allow empty/invalid reports`, () => {
    fs.existsSync.mockImplementationOnce(() => true); // check url folder
    fs.existsSync.mockImplementationOnce(() => false); // screenshot
    fs.readdirSync.mockImplementationOnce(() => ["9876", "1234", "5678"]); // assume scans folders use a sortable date-format

    mockJson("codescanalerts.json");
    mockJson("wappalyzer.json");

    expect(
      generateUrlReport({
        url: testUrl,
      })
    ).toMatchSnapshot();

    unMockJson("codescanalerts.json");
    unMockJson("wappalyzer.json");
  });

  test(`should detect screenshot if any`, () => {
    fs.existsSync.mockImplementationOnce(() => true); // check url folder
    fs.existsSync.mockImplementationOnce(() => true); // screenshot
    fs.readdirSync.mockImplementationOnce(() => ["9876", "1234", "5678"]); // assume scans folders use a sortable date-format
    expect(
      generateUrlReport({
        url: testUrl,
      }).screenshot
    ).toEqual(true);
  });
});
