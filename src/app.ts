import * as fs from 'fs';
import * as path from 'path';

class FilesPathManger {
    paths: Map<string, string[]>;
    constructor() {
        this.paths = new Map();
    }
    addPath(base: string, path: string) {
        if (!this.paths.has(base)) {
            this.paths.set(base, []);
        }
        const pathsArray = this.paths.get(base);
        if (pathsArray) {
            pathsArray.push(path);
        }
    }
    addMultiplesPaths(base: string, path: string[]) {
        if (!this.paths.has(base)) {
            this.paths.set(base, []);
        }
        const currentData = this.paths.get(base)
        if (currentData) {
            const newData = [...currentData, ...path];
            this.paths.set(base, newData);
        }
    }
    getKeys() {
        return this.paths.keys();
    }
    getByKey(key: string) {
        return this.paths.get(key)
    }
    mergeFilesPath(otherManager: FilesPathManger) {
        for (const base of otherManager.getKeys()) {
            const data = otherManager.getByKey(base);
            if (data) {
                this.addMultiplesPaths(base, data);
            }
        }
    }
    generatedObject() {
        const newObject: { [key: string]: any } = {};
        const keys = this.getKeys()
        for (const key of keys) {
            newObject[key] = this.getByKey(key);
        }
        return newObject;
    }
    saveFile() {

        const contenido = this.generatedObject();

        const contenidoString = JSON.stringify(contenido)

        // Escribe la cadena de texto en un archivo
        fs.writeFile('dist/datos.json', contenidoString, (error) => {
            if (error) {
                console.error('Error al escribir el archivo:', error);
            } else {
                console.log('Los datos se han guardado en datos.json');
            }
        });
    }
}

function readFilesRecursively(directoryPath: string) {
    const filesPaths = new FilesPathManger();
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            // Si es un directorio, llama a la función recursivamente
            const generatedFilePaths = readFilesRecursively(filePath);
            filesPaths.mergeFilesPath(generatedFilePaths);
        } else if (stats.isFile()) {
            const fileRelativePath = filePath.replace(/^src\\test\\notas\\/, '');
            if (!fileRelativePath.endsWith("index.md")) {
                const base = fileRelativePath.split(path.sep)[0];
                filesPaths.addPath(base, filePath)
            }
        }
    });

    return filesPaths;
}


// Ruta al directorio que deseas leer
const directorio = './src/test/notas';

const result = readFilesRecursively(directorio);
console.log(result)
result.saveFile();