import '../../public/css/footer.css'; // this will apply the css globally

export class Footer {

    private footer: HTMLElement;

    constructor() {
        this.footer = document.createElement("footer");
        this.footer.appendChild(this.createBuildNumberDiv());
        this.footer.appendChild(this.createRepositoryDiv());
        document.body.appendChild(this.footer);
    }

    private createBuildNumberDiv() {
        const buildNumber = BUILD_NUMBER; // injected by DefinePlugin
        const buildNumberDiv = document.createElement('div');
        buildNumberDiv.id = 'build-number-container';

        const buildNumberParagraph = document.createElement('p');
        buildNumberParagraph.innerText = "Build Number: " + buildNumber;

        buildNumberDiv.appendChild(buildNumberParagraph);
        return buildNumberDiv;
    }

    private createRepositoryDiv() {
        const repoUrl = REPO_URL; // injected by DefinePlugin
        const repositoryDiv = document.createElement('div')
        repositoryDiv.id = 'repository-container';

        const githubLink = document.createElement('a');
        githubLink.href = repoUrl;
        githubLink.target = '_blank'; // Opens link in a new tab
        //githubLink.innerText = 'GitHub Repository';

        const githubIcon = document.createElement('i');
        githubIcon.classList.add('fab', 'fa-github');

        githubLink.appendChild(githubIcon);
        repositoryDiv.appendChild(githubLink);

        return repositoryDiv;
    }
}
