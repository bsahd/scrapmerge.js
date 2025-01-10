import * as Diff3 from "npm:node-diff3";

function getPage(projectName, pageName) {
    return fetch(
        "https://scrapbox.io/api/pages/" +
            projectName +
            "/" +
            encodeURIComponent(pageName) + "/text",
    ).then((pageRes) => {
        if (pageRes.ok) {
            return pageRes.text();
        } else {
            return pageRes.text().then((text) => {
                console.error(pageRes.status, text);
                alert(`${pageName}:${pageRes.status}:${text}`);
            });
        }
    }).then((text) => text.split("\n").slice(1).join("\n"));
}

function getAvailability(projectName, pageName) {
    return fetch(
        "https://scrapbox.io/api/pages/" +
            projectName +
            "/" +
            encodeURIComponent(pageName),
    ).then((pageRes) => {
        if (pageRes.ok) {
            return pageRes.json();
        } else {
            return pageRes.text().then((text) => {
                console.error(pageRes.status, text);
                alert(`${pageName}:${pageRes.status}:${text}`);
            });
        }
    }).then((json) => {
        return json.persistent;
    });
}

const userName =
    document.querySelector("ul.user-menu li.list-header").innerText;
const projectName = scrapbox.Project.name;

scrapbox.PageMenu.addMenu({
    title: "branchTool",
    image: "https://i.gyazo.com/5587d1731c863ec1fdb2d46f706d8a08.png",
    // <a href="https://www.flaticon.com/free-icons/commit-git" title="commit git icons">Commit git icons created by Ferdinand - Flaticon</a>
});
scrapbox.PageMenu("branchTool").addItem({
    title: "branch",
    onClick: () => {
        const your = `${scrapbox.Page.title} (${userName})`;
        const older = `${scrapbox.Page.title} (${userName} backup)`;
        getAvailability(projectName, your).then((branchalreadyexits) => {
            if (branchalreadyexits) {
                window.open(
                    encodeURIComponent(
                        your,
                    ),
                );
            } else {
                let b = "";
                const lines = scrapbox.Page.lines.slice(1);
                lines.unshift({ text: `from ${scrapbox.Page.title}` });
                for (const a of lines) {
                    b += a.text + "\n";
                }
                console.log(b);
                scrapbox.Page.insertLine(`${userName} branch:[${your}]`, 1);
                scrapbox.Page.insertLine(` backup:[${older}]`, 2);
                window.open(
                    encodeURIComponent(
                        older,
                    ) + "?body=" +
                        encodeURIComponent(
                            b,
                        ),
                );
                window.open(
                    encodeURIComponent(
                        your,
                    ) + "?body=" +
                        encodeURIComponent(
                            b,
                        ),
                );
            }
        });
    },
});
scrapbox.PageMenu("branchTool").addItem({
    title: "merge",
    onClick: () => {
        const mine = scrapbox.Page.title;
        const your = `${scrapbox.Page.title} (${userName})`;
        const older = `${scrapbox.Page.title} (${userName} backup)`;
        getPage(projectName, mine).then((
            mineData,
        ) => [mineData]).then(([mineData]) => {
            return getPage(projectName, older).then((
                olderData,
            ) => [mineData, olderData]);
        })
            .then(([mineData, olderData]) => {
                return getPage(projectName, your).then((
                    yourData,
                ) => [mineData, olderData, yourData]);
            }).then(
                ([mineData, olderData, yourData]) => {
                    const diff3dat = Diff3.mergeDiff3(
                        mineData,
                        olderData,
                        yourData,
                        {
                            excludeFalseConflicts: true,
                            stringSeparator: /\n/,
                            label: { a: "main", o: "backup", b: userName },
                        },
                    );
                    console.log(diff3dat);
                    const joined = `${scrapbox.Page.title}(${userName} merged)`;
                    window.open(
                        encodeURIComponent(
                            older,
                        ),
                    );
                    window.open(
                        encodeURIComponent(
                            your,
                        ),
                    );
                    window.open(
                        encodeURIComponent(
                            joined,
                        ) + "?body=" +
                            encodeURIComponent(
                                diff3dat.result.join("\n"),
                            ),
                    );
                },
            );
    },
});
