export module TypeScript.Strasse.Street {
	export class Rue {
		public address:string;
	}	
}

var rue = new TypeScript.Strasse.Street.Rue();

rue.address = "1 Main Street";

void 0;

//bug 17403
//if (!module.exports) module.exports = "";